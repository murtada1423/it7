with open('C:/Users/Murtada Razaq/Desktop/mur/it7/app/admin/page.tsx', 'r') as f:
    content = f.read()
content = content.replace('IT7-assets', 'signage-assets')
content = content.replace('IT7_state', 'signage_state')
content = content.replace('IT7_display_settings', 'signage_display_settings')
content = content.replace('IT7_sync', 'signage_sync')
content = content.replace("from('signage_state')", "from('active_signage_state')")
# Keep branding text IT7 CONTROL and description IT7 storage bucket
with open('C:/Users/Murtada Razaq/Desktop/mur/it7/app/admin/page.tsx', 'w') as f:
    f.write(content)
print('Fixed technical terms')
