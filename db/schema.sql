CREATE TABLE IF NOT EXISTS profile (
                                       id INTEGER PRIMARY KEY,
                                       full_name TEXT,
                                       email TEXT,
                                       phone TEXT,
                                       location TEXT,
                                       summary TEXT,
                                       gemini_api_key TEXT
);

CREATE TABLE IF NOT EXISTS jobs (
                                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                                    title TEXT NOT NULL,
                                    company TEXT NOT NULL,
                                    location TEXT,
                                    start_date TEXT,
                                    end_date TEXT,
                                    is_current INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS job_responsibilities (
                                                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                                                    job_id INTEGER NOT NULL,
                                                    detail TEXT NOT NULL,
                                                    sort_order INTEGER DEFAULT 0,
                                                    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE
    );

CREATE TABLE IF NOT EXISTS skill_categories (
                                                id INTEGER PRIMARY KEY AUTOINCREMENT,
                                                name TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS skills (
                                      id INTEGER PRIMARY KEY AUTOINCREMENT,
                                      category_id INTEGER,
                                      name TEXT NOT NULL,
                                      FOREIGN KEY (category_id) REFERENCES skill_categories(id) ON DELETE SET NULL
    );

CREATE TABLE IF NOT EXISTS certifications (
                                              id INTEGER PRIMARY KEY AUTOINCREMENT,
                                              name TEXT NOT NULL,
                                              issuer TEXT,
                                              date_earned TEXT,
                                              expiration_date TEXT
);

CREATE TABLE IF NOT EXISTS awards (
                                      id INTEGER PRIMARY KEY AUTOINCREMENT,
                                      name TEXT NOT NULL,
                                      issuer TEXT,
                                      date_received TEXT,
                                      description TEXT
);

CREATE TABLE IF NOT EXISTS resumes (
                                       id INTEGER PRIMARY KEY AUTOINCREMENT,
                                       name TEXT NOT NULL,
                                       target_job TEXT,
                                       created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS resume_items (
                                            id INTEGER PRIMARY KEY AUTOINCREMENT,
                                            resume_id INTEGER NOT NULL,
                                            item_type TEXT NOT NULL,    -- 'job', 'responsibility', 'skill', 'cert', 'award'
                                            item_id INTEGER NOT NULL,
                                            sort_order INTEGER DEFAULT 0,
                                            FOREIGN KEY (resume_id) REFERENCES resumes(id) ON DELETE CASCADE
    );