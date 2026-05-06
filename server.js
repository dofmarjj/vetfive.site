const express = require("express");
const session = require("express-session");
const path = require("path");
const fs = require("fs");
const bcrypt = require("bcryptjs");
const multer = require("multer");
const slugify = require("slugify");
const Database = require("better-sqlite3");

const app = express();
const port = Number(process.env.PORT || 3000);

const rootDir = __dirname;
const uploadsDir = path.join(rootDir, "uploads");
const dbDir = path.join(rootDir, "data");
const dbPath = path.join(dbDir, "vetfive.db");

if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });

const db = new Database(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('owner','editor')),
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS site_content (
    content_key TEXT PRIMARY KEY,
    content_value TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS media (
    media_key TEXT PRIMARY KEY,
    media_path TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS doctors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    doctor_role TEXT NOT NULL,
    avatar_initials TEXT NOT NULL,
    short_description TEXT NOT NULL,
    about_text TEXT NOT NULL,
    education_text TEXT NOT NULL,
    focus_text TEXT NOT NULL,
    reception_text TEXT NOT NULL,
    image_path TEXT,
    is_published INTEGER NOT NULL DEFAULT 1,
    meta_title TEXT,
    meta_description TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
`);

const contentDefaults = {
  site_name: "Vetfive",
  hero_kicker: "Ветеринарна клініка",
  hero_title: "Vetfive — коли турбота має характер професіоналів",
  hero_subtitle:
    "Лікуємо, консультуємо та допомагаємо вашим улюбленцям швидше відновлюватися. Діагностика, терапія, хірургія та супровід під час лікування.",
  about_title: "Про нас",
  about_text:
    "Vetfive — це команда, яка ставиться до тварин як до членів родини. Ми поєднуємо сучасний підхід у діагностиці та лікуванні з людською турботою.",
  contacts_phone: "+38 (000) 000-00-00",
  contacts_phone_link: "+380000000000",
  contacts_email: "info@vetfive.ua",
  contacts_hours: "Пн–Сб: 09:00–19:00 • Нд: вихідний",
  contacts_map_src:
    "https://www.google.com/maps?q=%D0%9A%D0%B8%D1%97%D0%B2%2C%20%D0%9F%D1%80%D0%B8%D0%BA%D0%BB%D0%B0%D0%B4%20%D0%B2%D1%83%D0%BB%D0%B8%D1%86%D1%8F&output=embed",
  footer_subtitle: "Ветеринарна клініка"
};

for (const [key, value] of Object.entries(contentDefaults)) {
  db.prepare(
    "INSERT INTO site_content (content_key, content_value) VALUES (?, ?) ON CONFLICT(content_key) DO NOTHING"
  ).run(key, value);
}

db.prepare(
  "INSERT INTO media (media_key, media_path) VALUES (?, ?) ON CONFLICT(media_key) DO NOTHING"
).run("logo", "/assets/logo-1.png");

const seedDoctors = [
  {
    slug: "olena-ivanenko",
    full_name: "Олена Іваненко",
    doctor_role: "Ветеринарний лікар • терапія",
    avatar_initials: "ОІ",
    short_description: "Лікування захворювань, контроль стану та супровід.",
    about_text:
      "Олена консультує з питань терапії котів та собак: гострі та хронічні стани, підбір терапії та супровід після виписки.",
    education_text:
      "Вища ветеринарна освіта. Участь у семінарах з внутрішньої медицини дрібних тварин.",
    focus_text: "Терапія, контроль динаміки, ведення хронічних пацієнтів.",
    reception_text: "Графік уточнюйте за телефоном або через форму контактів."
  },
  {
    slug: "mykola-palamarchuk",
    full_name: "Микола Паламарчук",
    doctor_role: "Ветеринарний лікар • хірургія",
    avatar_initials: "МП",
    short_description:
      "Планування та проведення операцій, післяопераційний догляд.",
    about_text:
      "Микола веде планові та ургентні хірургічні втручання з повним супроводом пацієнта.",
    education_text:
      "Післядипломні курси з ветеринарної хірургії та анестезіології.",
    focus_text: "Хірургія, підготовка до операцій, післяопераційний контроль.",
    reception_text: "Запис через адміністратора або форму на сайті."
  },
  {
    slug: "kateryna-avramenko",
    full_name: "Катерина Авраменко",
    doctor_role: "Ветеринарний лікар • діагностика",
    avatar_initials: "КА",
    short_description: "УЗД, лабораторні обстеження, інтерпретація результатів.",
    about_text:
      "Катерина спеціалізується на інструментальній та лабораторній діагностиці.",
    education_text:
      "Сертифікації з УЗД та сучасних методів лабораторної діагностики.",
    focus_text: "УЗД, лабораторія, формування діагностичних висновків.",
    reception_text: "Доступність уточнюється при записі."
  },
  {
    slug: "sofiya-vlasenko",
    full_name: "Софія Власенко",
    doctor_role: "Ветеринарний лікар • профілактика",
    avatar_initials: "СВ",
    short_description: "Вакцинації, рекомендації з харчування та догляду.",
    about_text:
      "Софія займається профілактичними програмами, вакцинацією та консультаціями з догляду.",
    education_text:
      "Практика профілактичної ветеринарної медицини та нутриціології.",
    focus_text: "Профілактика, вакцинація, wellness-підхід.",
    reception_text: "Графік уточнюється у адміністратора."
  }
];

for (const doctor of seedDoctors) {
  db.prepare(
    `INSERT INTO doctors (
      slug, full_name, doctor_role, avatar_initials, short_description,
      about_text, education_text, focus_text, reception_text, is_published
    ) VALUES (
      @slug, @full_name, @doctor_role, @avatar_initials, @short_description,
      @about_text, @education_text, @focus_text, @reception_text, 1
    ) ON CONFLICT(slug) DO NOTHING`
  ).run(doctor);
}

const hasUsers = db.prepare("SELECT COUNT(*) AS count FROM users").get().count > 0;
if (!hasUsers) {
  const ownerPass = bcrypt.hashSync("vetfive123", 10);
  db.prepare(
    "INSERT INTO users (email, password_hash, role) VALUES (?, ?, ?)"
  ).run("owner@vetfive.local", ownerPass, "owner");
}

app.set("view engine", "ejs");
app.set("views", path.join(rootDir, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(
  session({
    secret: process.env.SESSION_SECRET || "vetfive-secret",
    resave: false,
    saveUninitialized: false
  })
);
app.use(express.static(rootDir));
app.use("/uploads", express.static(uploadsDir));

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || ".jpg";
    cb(null, `${Date.now()}-${Math.random().toString(16).slice(2)}${ext}`);
  }
});
const upload = multer({ storage });

function getContentMap() {
  const rows = db.prepare("SELECT content_key, content_value FROM site_content").all();
  return rows.reduce((acc, row) => {
    acc[row.content_key] = row.content_value;
    return acc;
  }, {});
}

function getMediaMap() {
  const rows = db.prepare("SELECT media_key, media_path FROM media").all();
  return rows.reduce((acc, row) => {
    acc[row.media_key] = row.media_path;
    return acc;
  }, {});
}

function requireAuth(req, res, next) {
  if (!req.session.user) return res.redirect("/admin/login");
  next();
}

function requireOwner(req, res, next) {
  if (!req.session.user || req.session.user.role !== "owner") {
    return res.status(403).send("Forbidden");
  }
  next();
}

app.get("/", (_req, res) => {
  const content = getContentMap();
  const media = getMediaMap();
  const doctors = db
    .prepare(
      "SELECT slug, full_name, doctor_role, avatar_initials, short_description FROM doctors WHERE is_published = 1 ORDER BY id"
    )
    .all();
  res.render("public-index", { content, media, doctors });
});

app.get("/doctors/:slug", (req, res) => {
  const doctor = db
    .prepare("SELECT * FROM doctors WHERE slug = ? AND is_published = 1")
    .get(req.params.slug);
  if (!doctor) return res.status(404).send("Doctor not found");
  const media = getMediaMap();
  const related = db
    .prepare("SELECT slug, full_name FROM doctors WHERE slug != ? AND is_published = 1 ORDER BY id LIMIT 3")
    .all(req.params.slug);
  res.render("doctor-profile", { doctor, related, media });
});

app.get("/admin/login", (_req, res) => {
  res.render("admin-login", { error: null });
});

app.post("/admin/login", (req, res) => {
  const { email, password } = req.body;
  const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return res.status(401).render("admin-login", { error: "Невірний email або пароль" });
  }
  req.session.user = { id: user.id, email: user.email, role: user.role };
  res.redirect("/admin");
});

app.post("/admin/logout", requireAuth, (req, res) => {
  req.session.destroy(() => res.redirect("/admin/login"));
});

app.get("/admin", requireAuth, (req, res) => {
  const content = getContentMap();
  const media = getMediaMap();
  const doctors = db.prepare("SELECT id, slug, full_name, doctor_role, is_published FROM doctors ORDER BY id DESC").all();
  const users = db.prepare("SELECT id, email, role, created_at FROM users ORDER BY id").all();
  res.render("admin-dashboard", {
    user: req.session.user,
    content,
    media,
    doctors,
    users
  });
});

app.post("/admin/content", requireAuth, (req, res) => {
  for (const [key, value] of Object.entries(req.body)) {
    db.prepare(
      "INSERT INTO site_content (content_key, content_value) VALUES (?, ?) ON CONFLICT(content_key) DO UPDATE SET content_value = excluded.content_value"
    ).run(key, String(value || ""));
  }
  res.redirect("/admin");
});

app.post("/admin/media/logo", requireAuth, upload.single("logo"), (req, res) => {
  if (!req.file) return res.redirect("/admin");
  const logoPath = `/uploads/${req.file.filename}`;
  db.prepare(
    "INSERT INTO media (media_key, media_path) VALUES (?, ?) ON CONFLICT(media_key) DO UPDATE SET media_path = excluded.media_path"
  ).run("logo", logoPath);
  res.redirect("/admin");
});

app.post("/admin/doctors", requireAuth, (req, res) => {
  const slug = slugify(req.body.slug || req.body.full_name || "", {
    lower: true,
    strict: true,
    locale: "uk"
  });
  if (!slug) return res.status(400).send("Invalid slug");
  db.prepare(
    `INSERT INTO doctors (
      slug, full_name, doctor_role, avatar_initials, short_description,
      about_text, education_text, focus_text, reception_text, is_published,
      meta_title, meta_description
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    slug,
    req.body.full_name || "",
    req.body.doctor_role || "",
    req.body.avatar_initials || "",
    req.body.short_description || "",
    req.body.about_text || "",
    req.body.education_text || "",
    req.body.focus_text || "",
    req.body.reception_text || "",
    req.body.is_published ? 1 : 0,
    req.body.meta_title || "",
    req.body.meta_description || ""
  );
  res.redirect("/admin");
});

app.post("/admin/doctors/:id", requireAuth, (req, res) => {
  const doctor = db.prepare("SELECT * FROM doctors WHERE id = ?").get(req.params.id);
  if (!doctor) return res.status(404).send("Doctor not found");
  const slug = slugify(req.body.slug || doctor.slug, {
    lower: true,
    strict: true,
    locale: "uk"
  });
  db.prepare(
    `UPDATE doctors
     SET slug = ?, full_name = ?, doctor_role = ?, avatar_initials = ?, short_description = ?,
         about_text = ?, education_text = ?, focus_text = ?, reception_text = ?, is_published = ?,
         meta_title = ?, meta_description = ?, updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`
  ).run(
    slug,
    req.body.full_name || "",
    req.body.doctor_role || "",
    req.body.avatar_initials || "",
    req.body.short_description || "",
    req.body.about_text || "",
    req.body.education_text || "",
    req.body.focus_text || "",
    req.body.reception_text || "",
    req.body.is_published ? 1 : 0,
    req.body.meta_title || "",
    req.body.meta_description || "",
    req.params.id
  );
  res.redirect("/admin");
});

app.post("/admin/users", requireAuth, requireOwner, (req, res) => {
  const { email, password, role } = req.body;
  if (!email || !password || !["owner", "editor"].includes(role)) {
    return res.status(400).send("Invalid user payload");
  }
  const hash = bcrypt.hashSync(password, 10);
  db.prepare("INSERT INTO users (email, password_hash, role) VALUES (?, ?, ?)").run(
    email,
    hash,
    role
  );
  res.redirect("/admin");
});

app.listen(port, () => {
  console.log(`Vetfive app running on http://localhost:${port}`);
});
