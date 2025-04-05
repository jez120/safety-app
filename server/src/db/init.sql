-- Drop tables if they exist (optional, useful for development reset)
-- DROP TABLE IF EXISTS comments;
-- DROP TABLE IF EXISTS suggestions;
-- DROP TABLE IF EXISTS users;

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL, -- Store hashed passwords only!
    role VARCHAR(20) DEFAULT 'employee' NOT NULL, -- e.g., 'employee', 'admin'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Suggestions Table
CREATE TABLE IF NOT EXISTS suggestions (
    suggestion_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    department VARCHAR(100), -- e.g., 'HR', 'IT', 'Operations'
    status VARCHAR(50) DEFAULT 'submitted' NOT NULL, -- e.g., 'submitted', 'under_review', 'approved', 'rejected', 'implemented'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    file_attachment_path VARCHAR(255), -- Store path to the uploaded file
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE -- Link to the user who submitted it
);

-- Comments Table
CREATE TABLE IF NOT EXISTS comments (
    comment_id SERIAL PRIMARY KEY,
    suggestion_id INT NOT NULL,
    user_id INT NOT NULL, -- User who made the comment
    comment_text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (suggestion_id) REFERENCES suggestions(suggestion_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE -- Link comment to user
);

-- Optional: Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_suggestions_status ON suggestions(status);
CREATE INDEX IF NOT EXISTS idx_suggestions_user_id ON suggestions(user_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Optional: Function to update the updated_at timestamp automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

-- Optional: Trigger to use the function on the suggestions table
DO $$ -- Use DO block to handle potential pre-existence of the trigger
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_suggestions_updated_at') THEN
        CREATE TRIGGER update_suggestions_updated_at
        BEFORE UPDATE ON suggestions
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- Seed some initial data (optional)
-- INSERT INTO users (username, email, password_hash, role) VALUES
-- ('admin_user', 'admin@example.com', 'some_secure_hash', 'admin'), -- Replace with a real bcrypt hash later
-- ('employee_user', 'employee@example.com', 'another_secure_hash', 'employee'); -- Replace with a real bcrypt hash later

-- INSERT INTO suggestions (user_id, title, description, department, status) VALUES
-- ( (SELECT user_id FROM users WHERE username = 'employee_user'), 'Improve Cafeteria Options', 'Add more vegetarian choices.', 'Facilities', 'submitted'),
-- ( (SELECT user_id FROM users WHERE username = 'employee_user'), 'Update Software Licenses', 'Need new licenses for design software.', 'IT', 'under_review');
