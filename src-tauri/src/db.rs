use std::path::{Path, PathBuf};
use rusqlite::{Connection, Result};
use serde::Serialize;

#[derive(Debug, Serialize)]
pub struct Files {
    pub id: i32,
    pub path: String,
}

#[derive(Debug, Serialize)]
pub struct Tags {
    pub id: i32,
    pub name: String,
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
    conn.execute("CREATE TABLE IF NOT EXISTS Tags (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL
        )", []
    )
    .expect("Failed to create Tags table");
    conn.execute(
        "CREATE TABLE IF NOT EXISTS FileTagMapping (
            file_id INTEGER,
            tag_id INTEGER,
            PRIMARY KEY (file_id, tag_id),
            FOREIGN KEY (file_id) REFERENCES Files(id) ON DELETE CASCADE,
            FOREIGN KEY (tag_id) REFERENCES Tags(id) ON DELETE CASCADE
        )", []).expect("Failed to create FileTagMapping table");
}

fn drop_files_table() {
    let conn = create_connection();
    conn.execute("DROP TABLE IF EXISTS Files", [])
        .expect("Failed to drop Files table");
    conn.execute("DROP TABLE IF EXISTS Tags", [])
        .expect("Failed to drop Tags table");
    conn.execute("DROP TABLE IF EXISTS FileTagMapping", [])
        .expect("Failed to drop FileTagMapping table");
}

// for Files table
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

pub fn delete_from_files_table(id: i32) -> Result<usize> {
    let conn = create_connection();
    conn.execute(
        "DELETE FROM Files WHERE id = ?1",
        [id],
    )
}

// for Tags table
pub fn select_all_tags() -> Result<Vec<Tags>> {
    let conn = create_connection();
    let mut stmt = conn.prepare("SELECT id, name FROM Tags")?;
    let tags_iter = stmt.query_map([], |row| {
        Ok(Tags {
            id: row.get(0)?,
            name: row.get(1)?,
        })
    })?;

    let mut tags = Vec::new();
    for tag in tags_iter {
        tags.push(tag.unwrap());
    }
    Ok(tags)
}

pub fn insert_to_tags_table(name: &str) -> Result<usize> {
    let conn = create_connection();
    let mut stmt = conn.prepare("SELECT id FROM Tags WHERE name = ?1").unwrap();
    let mut rows = stmt.query([name]).unwrap();
    let row = rows.next().unwrap();
    let exists = match row {
        Some(_) => true,
        None => false,
    };
    if exists {
        return Ok(0);
    }
    conn.execute(
        "INSERT INTO Tags (name) VALUES (?1)",
        [name],
    )
}

pub fn delete_from_tags_table(id: i32) -> Result<usize> {
    let conn = create_connection();
    conn.execute(
        "DELETE FROM Tags WHERE id = ?1",
        [id],
    )
}

// for FileTagMapping table
pub fn file_add_tag(file_id: i32, tag_id: i32) -> Result<usize> {
    let conn = create_connection();
    conn.execute(
        "INSERT INTO FileTagMapping (file_id, tag_id) VALUES (?1, ?2)",
        [file_id, tag_id],
    )
}

pub fn file_remove_tag(file_id: i32, tag_id: i32) -> Result<usize> {
    let conn = create_connection();
    conn.execute(
        "DELETE FROM FileTagMapping WHERE file_id = ?1 AND tag_id = ?2",
        [file_id, tag_id],
    )
}

// multitable operation
// return Ok(true) if exists
// return Ok(false) if added
pub fn add_file_tag(path: String, tag_name: String) -> Result<bool> {
    let conn = create_connection();
    let mut stmt = conn.prepare("SELECT id FROM Files WHERE path = ?1").unwrap();
    let mut rows = stmt.query([path]).unwrap();
    let row = rows.next().unwrap();
    let file_id = match row {
        Some(row) => row.get(0)?,
        None => return Err(rusqlite::Error::QueryReturnedNoRows),
    };
    let mut stmt = conn.prepare("SELECT id FROM Tags WHERE name = ?1").unwrap();
    let mut rows = stmt.query([tag_name.clone()]).unwrap();
    let row = rows.next().unwrap();
    let tag_id = match row {
        Some(row) => row.get(0)?,
        None => {
            conn.execute(
                "INSERT INTO Tags (name) VALUES (?1)",
                [tag_name],
            )?;
            conn.last_insert_rowid() as i32
        },
    };
    // check if exists
    let mut stmt = conn.prepare("SELECT file_id FROM FileTagMapping WHERE file_id = ?1 AND tag_id = ?2").unwrap();
    let mut rows = stmt.query([file_id, tag_id]).unwrap();
    let row = rows.next().unwrap();
    let exists = match row {
        Some(_) => true,
        None => false,
    };
    if exists {
        return Ok(true);
    }
    conn.execute(
        "INSERT INTO FileTagMapping (file_id, tag_id) VALUES (?1, ?2)",
        [file_id, tag_id],
    )?;
    Ok(false)
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