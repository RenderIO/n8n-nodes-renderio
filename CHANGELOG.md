# Changelog

## Unreleased

- Added RenderIO node version 2 for FFmpeg command fields with n8n expressions enabled.
- Kept node version 1 behavior unchanged so existing production workflows continue using legacy `{{alias}}` RenderIO placeholders.
- Added version 2 guidance and validation requiring RenderIO placeholders to use `<<alias>>`, reserving `{{ ... }}` for n8n expressions.
