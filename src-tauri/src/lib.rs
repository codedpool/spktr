use base64::{engine::general_purpose, Engine as _};
use std::fs;
use tauri::{
    image::Image,
    menu::{Menu, MenuItem},
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
    Manager,
};
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

#[tauri::command]
fn read_screenshot_as_base64(path: String) -> Result<String, String> {
    let bytes = fs::read(&path).map_err(|e| e.to_string())?;
    let b64 = general_purpose::STANDARD.encode(&bytes);
    let _ = fs::remove_file(&path);
    Ok(b64)
}

#[tauri::command]
fn set_clickable(app: tauri::AppHandle, clickable: bool) {
    let window = app.get_webview_window("overlay").unwrap();
    window.set_ignore_cursor_events(!clickable).unwrap();
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_screenshots::init())
        .setup(|app| {
            // ── Global shortcut ──────────────────────────────────────
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

            // ── Click-through DISABLED for dev/debug ─────────────────
            // We enable it back via set_clickable(false) from JS
            // window.set_ignore_cursor_events(true)?;

            // ── System Tray ──────────────────────────────────────────
            let toggle_i = MenuItem::with_id(app, "toggle", "Show / Hide", true, None::<&str>)?;
            let quit_i = MenuItem::with_id(app, "quit", "Quit Spktr", true, None::<&str>)?;
            let menu = Menu::with_items(app, &[&toggle_i, &quit_i])?;

            let icon_bytes = include_bytes!("../icons/32x32.png");
            let icon = Image::from_bytes(icon_bytes)?;

            TrayIconBuilder::new()
                .icon(icon)
                .menu(&menu)
                .tooltip("Spktr — AI Screen Assistant")
                .on_menu_event(|app, event| match event.id.as_ref() {
                    "toggle" => {
                        let window = app.get_webview_window("overlay").unwrap();
                        if window.is_visible().unwrap() {
                            window.hide().unwrap();
                        } else {
                            window.show().unwrap();
                            window.set_focus().unwrap();
                        }
                    }
                    "quit" => {
                        app.exit(0);
                    }
                    _ => {}
                })
                .on_tray_icon_event(|tray, event| {
                    if let TrayIconEvent::Click {
                        button: MouseButton::Left,
                        button_state: MouseButtonState::Up,
                        ..
                    } = event
                    {
                        let app = tray.app_handle();
                        let window = app.get_webview_window("overlay").unwrap();
                        if window.is_visible().unwrap() {
                            window.hide().unwrap();
                        } else {
                            window.show().unwrap();
                            window.set_focus().unwrap();
                        }
                    }
                })
                .build(app)?;

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            toggle_overlay,
            read_screenshot_as_base64,
            set_clickable
        ])
        .run(tauri::generate_context!())
        .expect("error while running Spktr");
}
