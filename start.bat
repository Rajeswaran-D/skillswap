@echo off
title SkillSwap - Student Skill Exchange Platform
cls
echo ========================================================
echo        SkillSwap - Student Skill Exchange Platform
echo ========================================================
echo.
echo Opening SkillSwap in your default web browser...
start "" "index.html"
echo.
echo [SUCCESS] SkillSwap is now running directly in your browser!
echo (Pure static HTML/CSS/JS with LocalStorage database)
echo.
echo ========================================================
echo  HOW TO HOST DIRECTLY ON GITHUB PAGES:
echo ========================================================
echo  1. Commit and push this project to your GitHub repository:
echo        git add .
echo        git commit -m "Add GitHub Pages static edition"
echo        git push origin main
echo.
echo  2. Open your repository on GitHub:
echo        Go to Settings -^> Pages
echo.
echo  3. Under "Build and deployment":
echo        Source: Deploy from a branch
echo        Branch: main
echo        Folder: / (root)
echo        Click "Save"
echo.
echo  4. In 1 minute, your live site URL will be ready at:
echo        https://<your-username>.github.io/<repo-name>/
echo ========================================================
echo.
pause
