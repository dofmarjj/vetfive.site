# Vetfive Content Model

## `site_content`
- `site_name`
- `hero_kicker`
- `hero_title`
- `hero_subtitle`
- `about_title`
- `about_text`
- `contacts_phone`
- `contacts_phone_link`
- `contacts_email`
- `contacts_hours`
- `contacts_map_src`
- `footer_subtitle`

## `media`
- `logo` -> image path for preloader/footer/admin previews

## `doctors`
- `slug` -> route key (`/doctors/:slug`)
- `full_name`
- `doctor_role`
- `avatar_initials`
- `short_description`
- `about_text`
- `education_text`
- `focus_text`
- `reception_text`
- `image_path` (reserved for profile image use)
- `is_published` (draft/published switch)
- `meta_title`
- `meta_description`

## Roles
- `owner`: full access + user management
- `editor`: content/media/doctors management
