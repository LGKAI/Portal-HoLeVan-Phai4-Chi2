IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Users' and xtype='U')
BEGIN
CREATE TABLE Users (
  id INT IDENTITY(1,1) PRIMARY KEY,
  phone VARCHAR(15) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  full_name NVARCHAR(100) NOT NULL,
  role VARCHAR(20) DEFAULT 'member' CHECK (role IN ('admin','member','guest')),
  avatar_url VARCHAR(500),
  member_id INT,
  is_active BIT DEFAULT 1,
  created_at DATETIME DEFAULT GETDATE()
)
END
GO

IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Members' and xtype='U')
BEGIN
CREATE TABLE Members (
  id INT IDENTITY(1,1) PRIMARY KEY,
  full_name NVARCHAR(100) NOT NULL,
  birth_name NVARCHAR(100),
  generation_in_branch INT NOT NULL,
  gender VARCHAR(10) CHECK (gender IN ('male','female','unknown')),
  birth_date NVARCHAR(100),
  death_date NVARCHAR(100),
  is_deceased BIT DEFAULT 0,
  occupation NVARCHAR(200),
  avatar_url VARCHAR(500),
  bio NVARCHAR(MAX),
  burial_place NVARCHAR(300),
  father_id INT REFERENCES Members(id),
  mother_id INT REFERENCES Members(id),
  spouse_id INT REFERENCES Members(id),
  spouse_type NVARCHAR(50),
  created_at DATETIME DEFAULT GETDATE(),
  updated_at DATETIME DEFAULT GETDATE(),
  created_by INT REFERENCES Users(id)
)
END
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE Name = N'spouse_type' AND Object_ID = Object_ID(N'Members'))
BEGIN
    ALTER TABLE Members ADD spouse_type NVARCHAR(50);
END
GO

IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='News' and xtype='U')
BEGIN
CREATE TABLE News (
  id INT IDENTITY(1,1) PRIMARY KEY,
  title NVARCHAR(300) NOT NULL,
  slug VARCHAR(300) NOT NULL UNIQUE,
  content NVARCHAR(MAX) NOT NULL,
  thumbnail_url VARCHAR(500),
  category VARCHAR(20) DEFAULT 'news' CHECK (category IN ('news','event','announcement')),
  author_id INT REFERENCES Users(id),
  published_at DATETIME DEFAULT GETDATE(),
  is_published BIT DEFAULT 0,
  view_count INT DEFAULT 0
)
END
GO

IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Documents' and xtype='U')
BEGIN
CREATE TABLE Documents (
  id INT IDENTITY(1,1) PRIMARY KEY,
  title NVARCHAR(300) NOT NULL,
  description NVARCHAR(MAX),
  file_url VARCHAR(500),
  thumbnail_url VARCHAR(500),
  doc_type VARCHAR(20) DEFAULT 'text' CHECK (doc_type IN ('text','image','video','pdf')),
  author_id INT REFERENCES Users(id),
  created_at DATETIME DEFAULT GETDATE()
)
END
GO

IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='QuizSets' and xtype='U')
BEGIN
CREATE TABLE QuizSets (
  id INT IDENTITY(1,1) PRIMARY KEY,
  title NVARCHAR(300) NOT NULL,
  description NVARCHAR(MAX),
  created_by INT REFERENCES Users(id),
  created_at DATETIME DEFAULT GETDATE()
)
END
GO

IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Questions' and xtype='U')
BEGIN
CREATE TABLE Questions (
  id INT IDENTITY(1,1) PRIMARY KEY,
  quiz_set_id INT REFERENCES QuizSets(id),
  question_text NVARCHAR(MAX) NOT NULL,
  options NVARCHAR(MAX) NOT NULL,
  correct_answer INT NOT NULL,
  explanation NVARCHAR(MAX),
  order_num INT DEFAULT 1
)
END
GO

IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='QuizAttempts' and xtype='U')
BEGIN
CREATE TABLE QuizAttempts (
  id INT IDENTITY(1,1) PRIMARY KEY,
  user_id INT REFERENCES Users(id),
  quiz_set_id INT REFERENCES QuizSets(id),
  score INT DEFAULT 0,
  total_questions INT DEFAULT 0,
  answers NVARCHAR(MAX),
  attempted_at DATETIME DEFAULT GETDATE()
)
END
GO


-- Seed admin user and member
IF NOT EXISTS (SELECT * FROM Users WHERE phone = '0901234567')
BEGIN
  INSERT INTO Users (phone, password_hash, full_name, role)
  VALUES ('0901234567', '$2a$10$Gj.6jCMx1vcs0gQOjckoguDrl6Y3mX5F0EUl7jqkdeTMMd/QNfPyW', N'Quản trị viên', 'admin')
END
GO
