#!/bin/bash
# Life-OS Chief of Staff — Single command launcher
# Usage: just type 'cos' from anywhere

SNAME="work"
DIR="/mnt/c/Users/Pc/desktop/life-os"

# Already inside tmux? Just launch claude
if [ -n "$TMUX" ]; then
    cd "$DIR"
    claude
    exit 0
fi

# Session exists? Kill it and start fresh with claude
if tmux has-session -t $SNAME 2>/dev/null; then
    tmux kill-session -t $SNAME
fi

# Create new tmux session and launch claude inside it
tmux new -s $SNAME -c "$DIR" "claude"
