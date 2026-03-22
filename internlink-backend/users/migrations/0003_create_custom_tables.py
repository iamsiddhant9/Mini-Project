from django.db import migrations


CREATE_TABLES_SQL = """
CREATE TABLE IF NOT EXISTS users (
    id                     SERIAL PRIMARY KEY,
    email                  VARCHAR(255) UNIQUE NOT NULL,
    password_hash          VARCHAR(255) NOT NULL DEFAULT '',
    name                   VARCHAR(255) NOT NULL,
    role                   VARCHAR(20)  NOT NULL DEFAULT 'student'
                           CHECK (role IN ('student','recruiter','admin')),
    branch                 VARCHAR(100),
    year                   INTEGER CHECK (year BETWEEN 1 AND 5),
    university             VARCHAR(255),
    bio                    TEXT,
    github_url             VARCHAR(500),
    linkedin_url           VARCHAR(500),
    portfolio_url          VARCHAR(500),
    profile_photo_url      VARCHAR(500),
    preferred_mode         VARCHAR(20) DEFAULT 'Any',
    profile_strength       INTEGER DEFAULT 0,
    is_active              BOOLEAN DEFAULT TRUE,
    is_verified            BOOLEAN DEFAULT FALSE,
    is_approved            BOOLEAN DEFAULT FALSE,
    company_id             INTEGER,
    google_sub             VARCHAR(255) DEFAULT '',
    settings_notifications TEXT DEFAULT '{}',
    settings_privacy       TEXT DEFAULT '{}',
    settings_preferences   TEXT DEFAULT '{}',
    created_at             TIMESTAMPTZ DEFAULT NOW(),
    updated_at             TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS companies (
    id         SERIAL PRIMARY KEY,
    name       VARCHAR(255) UNIQUE NOT NULL,
    website    VARCHAR(500),
    industry   VARCHAR(100),
    logo_url   VARCHAR(500),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS internships (
    id            SERIAL PRIMARY KEY,
    company_id    INTEGER REFERENCES companies(id) ON DELETE SET NULL,
    posted_by     INTEGER,
    title         VARCHAR(255) NOT NULL,
    description   TEXT,
    location      VARCHAR(255),
    mode          VARCHAR(20) CHECK (mode IN ('Remote','Hybrid','On-site')),
    category      VARCHAR(50),
    stipend       VARCHAR(100) DEFAULT 'Competitive',
    stipend_num   INTEGER,
    deadline      DATE,
    source        VARCHAR(50) DEFAULT 'manual',
    source_url    VARCHAR(500),
    apply_url     VARCHAR(500),
    is_active     BOOLEAN DEFAULT TRUE,
    is_verified   BOOLEAN DEFAULT FALSE,
    search_vector TSVECTOR,
    created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tags (
    id       SERIAL PRIMARY KEY,
    name     VARCHAR(100) UNIQUE NOT NULL,
    category VARCHAR(50) DEFAULT 'Other',
    color    VARCHAR(20) DEFAULT '#64748b'
);

CREATE TABLE IF NOT EXISTS internship_tags (
    internship_id INTEGER REFERENCES internships(id) ON DELETE CASCADE,
    tag_id        INTEGER REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (internship_id, tag_id)
);

CREATE TABLE IF NOT EXISTS user_skills (
    id       SERIAL PRIMARY KEY,
    user_id  INTEGER REFERENCES users(id) ON DELETE CASCADE,
    tag_id   INTEGER REFERENCES tags(id) ON DELETE CASCADE,
    level    INTEGER DEFAULT 50 CHECK (level BETWEEN 0 AND 100),
    verified BOOLEAN DEFAULT FALSE,
    UNIQUE (user_id, tag_id)
);

CREATE TABLE IF NOT EXISTS applications (
    id             SERIAL PRIMARY KEY,
    user_id        INTEGER REFERENCES users(id) ON DELETE CASCADE,
    internship_id  INTEGER REFERENCES internships(id) ON DELETE CASCADE,
    status         VARCHAR(30) DEFAULT 'Applied',
    stage          VARCHAR(30) DEFAULT 'Applied',
    notes          TEXT,
    applied_at     TIMESTAMPTZ DEFAULT NOW(),
    updated_at     TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (user_id, internship_id)
);

CREATE TABLE IF NOT EXISTS saved_internships (
    id             SERIAL PRIMARY KEY,
    user_id        INTEGER REFERENCES users(id) ON DELETE CASCADE,
    internship_id  INTEGER REFERENCES internships(id) ON DELETE CASCADE,
    saved_at       TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (user_id, internship_id)
);

CREATE TABLE IF NOT EXISTS match_scores (
    id             SERIAL PRIMARY KEY,
    user_id        INTEGER REFERENCES users(id) ON DELETE CASCADE,
    internship_id  INTEGER REFERENCES internships(id) ON DELETE CASCADE,
    score          INTEGER DEFAULT 0,
    verdict        VARCHAR(20) DEFAULT 'weak',
    reasons        JSONB DEFAULT '[]',
    missing_skills JSONB DEFAULT '[]',
    computed_at    TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (user_id, internship_id)
);

CREATE TABLE IF NOT EXISTS hackathons (
    id          SERIAL PRIMARY KEY,
    title       VARCHAR(255) NOT NULL,
    organizer   VARCHAR(255),
    theme       VARCHAR(100),
    mode        VARCHAR(20) CHECK (mode IN ('Online','Offline','Hybrid')),
    status      VARCHAR(20) DEFAULT 'upcoming',
    prize       VARCHAR(255),
    deadline    DATE,
    start_date  DATE,
    end_date    DATE,
    apply_url   VARCHAR(500),
    image_url   VARCHAR(500),
    description TEXT,
    is_active   BOOLEAN DEFAULT TRUE,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO users (email, password_hash, name, role, is_active, is_approved, is_verified)
VALUES (
    'admin@internlink.com',
    'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3',
    'Admin', 'admin', TRUE, TRUE, TRUE
) ON CONFLICT (email) DO NOTHING;
"""


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0002_remove_notification_user_notification_user_id'),
    ]

    operations = [
        migrations.RunSQL(CREATE_TABLES_SQL, migrations.RunSQL.noop),
    ]
