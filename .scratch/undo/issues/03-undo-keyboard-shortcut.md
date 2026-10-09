# 03: Keyboard undo shortcut

**What to build:** Pressing Cmd/Ctrl+Z performs the same single undo step as the button (a no-op when there is nothing to undo), so players can undo from the keyboard.

**Blocked by:** 02 (Undo button)

**Status:** ready-for-agent

- [x] Cmd/Ctrl+Z triggers one undo step (reverts the last board/notes change)
- [x] It is a no-op when the history is empty (nothing to undo) and while the puzzle is solved
- [x] The default browser undo behavior is suppressed for the shortcut
- [x] It performs the identical undo as the button (same handler)
