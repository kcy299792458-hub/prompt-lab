# Prompt Lab Product Plan

## 1. Service Direction

Prompt Lab is a Korean-first website where people can share, find, copy, and save useful AI prompts.

The first version should be simple:

- Free prompt sharing
- Korean UI
- ChatGPT, Claude, Gemini, and image-generation prompts
- Login enabled
- Clean community-style design

The goal of the MVP is not to become a full marketplace immediately. The goal is to prove that users want to upload and discover prompts.

## 2. Target Users

Primary users:

- People who want to use AI better at work
- Marketers and content creators
- Students and self-learners
- People who use image-generation AI
- People who are good at writing prompts and want to share them

## 3. MVP Features

The first version should include:

1. Home page
2. Prompt list page
3. Prompt detail page
4. Prompt submission page
5. Search
6. Category filtering
7. Login and signup
8. Bookmark or like
9. My page

Features to postpone:

- Paid prompt sales
- Comments
- Creator follow system
- Advanced ranking
- Prompt execution inside the site
- Admin dashboard
- Team or company accounts

## 4. Pages

### Home

Purpose: Help users quickly understand the site and find useful prompts.

Content:

- Search input
- Popular prompts
- Latest prompts
- Category shortcuts

### Prompt List

Purpose: Let users browse and filter prompts.

Content:

- Search input
- Category filter
- AI model filter
- Prompt cards

Prompt card fields:

- Title
- Short description
- Category
- Tags
- AI model
- Like count
- Bookmark button

### Prompt Detail

Purpose: Let users read and copy a prompt.

Content:

- Title
- Description
- Prompt body
- Copy button
- Category
- Tags
- AI model
- Author
- Like button
- Bookmark button

### Submit Prompt

Purpose: Let logged-in users upload prompts.

Fields:

- Title
- Short description
- Prompt body
- Category
- Tags
- AI model

### Login

Purpose: Let users create an account and save their own activity.

Recommended first version:

- Email login
- Google login if easy to add with Supabase

### My Page

Purpose: Let users manage their own prompts and saved prompts.

Content:

- My uploaded prompts
- My bookmarked prompts

## 5. Categories

Initial categories:

- Writing
- Marketing
- Work and Productivity
- Development
- Image Generation
- Education and Study

Korean UI labels:

- 글쓰기
- 마케팅
- 업무/생산성
- 개발
- 이미지 생성
- 교육/학습

## 6. Prompt Data Model

Each prompt should have:

- id
- title
- description
- body
- category
- tags
- ai_model
- author_id
- like_count
- bookmark_count
- view_count
- created_at
- updated_at

Example:

```text
title: 블로그 글 초안 작성 프롬프트
description: 키워드만 넣으면 SEO용 블로그 초안을 만들어주는 프롬프트
category: 글쓰기
tags: 블로그, SEO, 마케팅
ai_model: ChatGPT
body: 너는 전문 블로그 에디터야...
```

## 7. Recommended Tech Stack

Recommended stack:

- Next.js for the website
- Supabase for database and login
- Vercel for deployment
- Tailwind CSS for styling

Reason:

- Good for beginners with AI coding help
- Low server-management burden
- Free tiers are enough for the first version
- Easy to deploy later

## 8. First Build Scope

Build order:

1. Create the Next.js project
2. Build static UI pages first
3. Add sample prompt data
4. Add search and category filtering
5. Connect Supabase database
6. Add login
7. Add prompt submission
8. Add bookmark or like
9. Deploy to Vercel

## 9. Product Principle

The first version should feel useful immediately.

That means:

- Users can find prompts quickly
- Prompt cards are easy to scan
- The copy button is obvious
- Uploading a prompt is simple
- The site should not feel like a marketing landing page

## 10. Working Name

Working name:

```text
Prompt Lab
```

Korean display name:

```text
프롬프트랩
```

The name can change later before buying a domain.
