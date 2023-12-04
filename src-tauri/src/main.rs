// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
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

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![file_list, file_add, file_delete])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
