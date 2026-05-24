---
title: "{{ replace .Name "-" " " | title }}"
date: {{ .Date }}
# Set to true to hide this announcement (e.g., after a holiday passes).
# Hidden announcements stay in the archive but don't appear on the homepage.
expired: false
---

Write your announcement here. Keep it short — one or two sentences is plenty.
For example: "We'll be closed Thursday, Nov 27 for Thanksgiving. Back open Friday at 9 AM."
