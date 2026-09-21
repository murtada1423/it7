with open(r'C:\Users\Murtada Razaq\Desktop\mur\it7\app\admin\page.tsx', 'r') as f:
    content = f.read()
content = content.replace("useState<'cover' | 'contain'>('cover')", "useState<'cover' | 'contain' | 'fill' | 'scale-down'>('cover')")
with open(r'C:\Users\Murtada Razaq\Desktop\mur\it7\app\admin\page.tsx', 'w') as f:
    f.write(content)
print('Fixed preview mode type')
