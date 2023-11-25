use std::path::{Path, PathBuf};
use rusqlite::{Connection, Result};
use serde::Serialize;

#[derive(Debug, Serialize)]
pub struct Files {
    pub id: i32,
    pub path: String,
}

fn get_database_path() -> PathBuf {
    // 项目根目录的 data 文件夹中
    // Path::new("data").join("dev.db")
    let db_path = "/Users/sjy/Coding/app/pdf-tagger/data";
    Path::new(db_path).join("dev.db")
}

fn create_connection() -> Connection {
    let database_path = get_database_path();
    Connection::open(&database_path).expect("Failed to open database")
}

fn create_files_table() {
    let conn = create_connection();
    conn.execute(
        "CREATE TABLE IF NOT EXISTS Files (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            path TEXT NOT NULL
        )",
        [],
    )
    .expect("Failed to create Files table");
}

fn drop_files_table() {
    let conn = create_connection();
    conn.execute("DROP TABLE IF EXISTS Files", [])
        .expect("Failed to drop Files table");
}

pub fn insert_to_files_table(path: &str) -> Result<usize> {
    let conn = create_connection();
    let mut stmt = conn.prepare("SELECT id FROM Files WHERE path = ?1").unwrap();
    let mut rows = stmt.query([path]).unwrap();
    let row = rows.next().unwrap();
    let exists = match row {
        Some(_) => true,
        None => false,
    };
    if exists {
        return Ok(0);
    }
    conn.execute(
        "INSERT INTO Files (path) VALUES (?1)",
        [path],
    )
}


pub fn select_from_files_table() -> Result<Vec<Files>> {
    let conn = create_connection();
    let mut stmt = conn.prepare("SELECT id, path FROM Files")?;
    let files_iter = stmt.query_map([], |row| {
        Ok(Files {
            id: row.get(0)?,
            path: row.get(1)?,
        })
    })?;

    let mut files = Vec::new();
    for file in files_iter {
        files.push(file.unwrap());
    }
    Ok(files)
}

#[test]
fn create_table() {
    drop_files_table();
    // 创建 Files 表
    create_files_table();
}

#[test]
fn insert_table() {
    // 插入数据
    let files = vec![
        "/path/to/file1.pdf",
        "/path/to/file2.pdf",
        ];
    for file in files {
        let size = match insert_to_files_table(file) {
            Ok(size) => size,
            Err(_) => 0,
        };
        println!("inserted {} rows", size);
    }
}

#[test]
fn select_all() {
    // 查询数据
    let files = select_from_files_table().unwrap();
    for file in files {
        println!("id: {}, path: {}", file.id, file.path);
    }
}