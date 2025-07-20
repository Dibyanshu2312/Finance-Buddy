-- Users table (stores Clerk user IDs)
CREATE TABLE [dbo].[users] (
    id INT IDENTITY(1,1) PRIMARY KEY,
    clerk_user_id NVARCHAR(255) NOT NULL UNIQUE,
    created_at DATETIME DEFAULT GETDATE()
);

-- Transactions table
CREATE TABLE [dbo].[transactions] (
    id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NOT NULL,
    amount DECIMAL(18,2) NOT NULL,
    category NVARCHAR(100) NOT NULL,
    type NVARCHAR(10) NOT NULL, -- 'income' or 'expense'
    description NVARCHAR(255),
    date DATETIME NOT NULL DEFAULT GETDATE(),
    FOREIGN KEY (user_id) REFERENCES users(id)
); 