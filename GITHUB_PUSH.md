# Push to GitHub - Final Steps (Run in PowerShell)

# 1. Initialize repo
cd "C:\Users\Murtada Razaq\Desktop\mur\it7"
git init

# 2. Add remote
# Note: Make sure you have created https://github.com/murtada1423/itt7 first (empty repo)
git remote add origin https://github.com/murtada1423/itt7.git

# 3. Stage everything (excludes .env.local, node_modules, .next per .gitignore)
git add .

# 4. Commit
git commit -m "IT7 Vertical Digital Signage System - Ready"

# 5. Push (you will be asked for GitHub token/credentials)
git branch -M main
git push -u origin main
