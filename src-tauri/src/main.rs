// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
use std::process::Command;
pub mod db;

#[tauri::command]
fn file_list() -> Vec<db::Files> {
    let files = match db::select_from_files_table() {
        Ok(files) => files,
        Err(_) => {
            Vec::new()
        }
    };
    files
}

#[tauri::command]
fn file_add(path: String) -> usize {
    let size = match db::insert_to_files_table(&path) {
        Ok(size) => size,
        Err(_) => 0,
    };
    size
}

#[tauri::command]
fn file_delete(id: i32) -> usize {
    let size = match db::delete_from_files_table(id) {
        Ok(size) => size,
        Err(_) => 0,
    };
    size
}

#[tauri::command]
fn open_file_native(path: String) {
    let _output = Command::new("open")
        .arg(path)
        .output()
        .expect("failed to execute process");
}

#[tauri::command]
fn add_tag(path: String, tag: String) -> Result<bool, String> {
    match db::add_file_tag(path, tag) {
        Ok(exists) => Ok(exists),
        Err(err) => Err(err.to_string()),
    }
}

#[tauri::command]
fn get_tag_list() -> Vec<db::Tags> {
    let tags = match db::select_all_tags() {
        Ok(tags) => tags,
        Err(_) => {
            Vec::new()
        }
    };
    tags
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![file_list, file_add, file_delete, open_file_native, add_tag, get_tag_list])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
