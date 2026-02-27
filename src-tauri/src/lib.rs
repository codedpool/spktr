use tauri::Manager;
use tauri_plugin_global_shortcut::{Code, GlobalShortcutExt, Modifiers, Shortcut, ShortcutState};

#[tauri::command]
fn toggle_overlay(app: tauri::AppHandle) {
    let window = app.get_webview_window("overlay").unwrap();
    if window.is_visible().unwrap() {
        window.hide().unwrap();
    } else {
        window.show().unwrap();
        window.set_focus().unwrap();
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .setup(|app| {
            let shortcut = Shortcut::new(Some(Modifiers::CONTROL | Modifiers::SHIFT), Code::Space);
            let shortcut_clone = shortcut.clone();

            app.handle().plugin(
                tauri_plugin_global_shortcut::Builder::new()
                    .with_handler(move |app, pressed, event| {
                        if pressed == &shortcut_clone && event.state() == ShortcutState::Pressed {
                            let window = app.get_webview_window("overlay").unwrap();
                            if window.is_visible().unwrap() {
                                window.hide().unwrap();
                            } else {
                                window.show().unwrap();
                                window.set_focus().unwrap();
                            }
                        }
                    })
                    .build(),
            )?;

            app.global_shortcut().register(shortcut)?;

            // Click-through on transparent areas
            let window = app.get_webview_window("overlay").unwrap();
            window.set_ignore_cursor_events(true)?;

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![toggle_overlay])
        .run(tauri::generate_context!())
        .expect("error while running Spktr");
}
