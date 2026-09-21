with open(r'C:\Users\Murtada Razaq\Desktop\mur\it7\app\admin\page.tsx', 'r') as f:
    content = f.read()
old_text = "previewMode === 'scale-down' ? 'object-scale-down'"
new_text = "previewMode === 'scale-down' ? 'object-scale-down' : previewMode === 'fit-to-page' ? 'object-contain scale-105'"
content = content.replace(old_text, new_text)
with open(r'C:\Users\Murtada Razaq\Desktop\mur\it7\app\admin\page.tsx', 'w') as f:
    f.write(content)
print('Fixed admin preview mode')
