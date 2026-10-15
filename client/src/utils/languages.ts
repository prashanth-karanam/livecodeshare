import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import { cpp } from '@codemirror/lang-cpp';
import { java } from '@codemirror/lang-java';
import { rust } from '@codemirror/lang-rust';
import { html } from '@codemirror/lang-html';
import { css } from '@codemirror/lang-css';
import { json } from '@codemirror/lang-json';
import { sql } from '@codemirror/lang-sql';
import { php } from '@codemirror/lang-php';
import { markdown } from '@codemirror/lang-markdown';
import type { Extension } from '@codemirror/state';

export interface LanguageDef {
  id: string;
  name: string;
  extension: () => Extension;
  fileExt: string;
  isRunnable: boolean;
  canWebPreview: boolean;
  defaultCode: string;
}

export const SUPPORTED_LANGUAGES: Record<string, LanguageDef> = {
  javascript: {
    id: 'javascript',
    name: 'JavaScript',
    extension: () => javascript({ jsx: true }),
    fileExt: 'js',
    isRunnable: true,
    canWebPreview: false,
    defaultCode: `// Welcome to LiveCodeShare!
// Collaborate live with friends on laptop, tablet, or phone.

function calculateTeamStats(members) {
  console.log(\`Calculating stats for \${members.length} team members...\`);
  return members.map(m => ({
    name: m.name,
    xp: m.score * 10,
    status: m.score > 80 ? 'Elite' : 'Active'
  }));
}

const team = [
  { name: 'Alex', score: 95 },
  { name: 'Sam', score: 84 },
  { name: 'Jordan', score: 72 }
];

console.log("Team Roster:");
console.table(calculateTeamStats(team));
`
  },
  typescript: {
    id: 'typescript',
    name: 'TypeScript',
    extension: () => javascript({ typescript: true }),
    fileExt: 'ts',
    isRunnable: true,
    canWebPreview: false,
    defaultCode: `// TypeScript Collaborative Playground
interface Collaborator {
  id: string;
  name: string;
  device: 'Laptop' | 'Tablet' | 'Phone';
  online: boolean;
}

const activeUsers: Collaborator[] = [
  { id: '1', name: 'You', device: 'Laptop', online: true },
  { id: '2', name: 'Friend', device: 'Tablet', online: true }
];

function greetCollaborators(users: Collaborator[]): void {
  for (const user of users) {
    console.log(\`✨ Welcome \${user.name}! Coding from a \${user.device}.\`);
  }
}

greetCollaborators(activeUsers);
`
  },
  python: {
    id: 'python',
    name: 'Python 3',
    extension: () => python(),
    fileExt: 'py',
    isRunnable: true,
    canWebPreview: false,
    defaultCode: `# Python 3 Real-time Session
import math

def analyze_dataset(data):
    avg = sum(data) / len(data)
    variance = sum((x - avg) ** 2 for x in data) / len(data)
    std_dev = math.sqrt(variance)
    return {"mean": round(avg, 2), "std_dev": round(std_dev, 2)}

numbers = [12, 45, 67, 89, 34, 56, 78, 90, 23]
print("Dataset:", numbers)
print("Analysis Results:", analyze_dataset(numbers))
`
  },
  cpp: {
    id: 'cpp',
    name: 'C++',
    extension: () => cpp(),
    fileExt: 'cpp',
    isRunnable: true,
    canWebPreview: false,
    defaultCode: `// C++ Collaborative Session
#include <iostream>
#include <vector>
#include <numeric>

int main() {
    std::vector<int> nums = {10, 25, 40, 55, 70};
    int total = std::accumulate(nums.begin(), nums.end(), 0);

    std::cout << "🚀 LiveCodeShare C++ Engine" << std::endl;
    std::cout << "Total elements: " << nums.size() << std::endl;
    std::cout << "Accumulated sum: " << total << std::endl;
    return 0;
}
`
  },
  c: {
    id: 'c',
    name: 'C',
    extension: () => cpp(),
    fileExt: 'c',
    isRunnable: true,
    canWebPreview: false,
    defaultCode: `// C Programming
#include <stdio.h>

int main() {
    char greeting[] = "Hello from LiveCodeShare!";
    printf("%s\\n", greeting);
    printf("Real-time live multi-device coding enabled.\\n");
    return 0;
}
`
  },
  java: {
    id: 'java',
    name: 'Java',
    extension: () => java(),
    fileExt: 'java',
    isRunnable: true,
    canWebPreview: false,
    defaultCode: `// Java Main Class
public class Main {
    public static void main(String[] args) {
        System.out.println("Hello from LiveCodeShare Java Runner!");
        int a = 15;
        int b = 25;
        System.out.println("Result: " + a + " + " + b + " = " + (a + b));
    }
}
`
  },
  rust: {
    id: 'rust',
    name: 'Rust',
    extension: () => rust(),
    fileExt: 'rs',
    isRunnable: true,
    canWebPreview: false,
    defaultCode: `// Rust Playground
fn main() {
    let message = "Collaborative Rust in real-time!";
    println!("{}", message);
    
    let mut sum = 0;
    for i in 1..=10 {
        sum += i;
    }
    println!("Sum 1..10 = {}", sum);
}
`
  },
  go: {
    id: 'go',
    name: 'Go',
    extension: () => cpp(), // fallback highlight
    fileExt: 'go',
    isRunnable: true,
    canWebPreview: false,
    defaultCode: `package main

import "fmt"

func main() {
    fmt.Println("🚀 Welcome to Go live coding!")
    names := []string{"Alice", "Bob", "Charlie"}
    for idx, name := range names {
        fmt.Printf("[%d] Collaborator: %s\\n", idx+1, name)
    }
}
`
  },
  html: {
    id: 'html',
    name: 'HTML / CSS / JS',
    extension: () => html(),
    fileExt: 'html',
    isRunnable: false,
    canWebPreview: true,
    defaultCode: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Live Web Preview</title>
  <style>
    * { box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      margin: 0;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: radial-gradient(circle at 50% 20%, #1e293b, #0f172a);
      color: #f8fafc;
      padding: 1.5rem;
      text-align: center;
    }
    .card {
      background: rgba(30, 41, 59, 0.7);
      border: 1px solid rgba(56, 189, 248, 0.3);
      backdrop-filter: blur(12px);
      padding: 2.5rem;
      border-radius: 1.5rem;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7);
      max-width: 480px;
      width: 100%;
    }
    h1 {
      font-size: 1.85rem;
      margin-bottom: 0.5rem;
      background: linear-gradient(to right, #38bdf8, #818cf8);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    p { color: #94a3b8; font-size: 0.95rem; line-height: 1.5; margin-bottom: 1.5rem; }
    .btn {
      background: linear-gradient(135deg, #38bdf8, #2563eb);
      color: #fff;
      border: none;
      padding: 0.75rem 1.75rem;
      border-radius: 9999px;
      font-weight: 600;
      cursor: pointer;
      font-size: 1rem;
      box-shadow: 0 4px 14px 0 rgba(56, 189, 248, 0.39);
      transition: all 0.2s ease;
    }
    .btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(56, 189, 248, 0.5);
    }
    .counter-badge {
      display: inline-block;
      margin-top: 1.25rem;
      background: rgba(56, 189, 248, 0.15);
      border: 1px solid rgba(56, 189, 248, 0.3);
      padding: 0.35rem 1rem;
      border-radius: 20px;
      font-size: 0.85rem;
      color: #38bdf8;
    }
  </style>
</head>
<body>
  <div class="card">
    <h1>🚀 Live Web Preview</h1>
    <p>Any code typed on laptop, tablet, or phone updates here live for everyone!</p>
    <button class="btn" id="clickBtn">Click Me!</button>
    <br/>
    <div class="counter-badge" id="counter">Clicks: 0</div>
  </div>

  <script>
    let count = 0;
    const btn = document.getElementById('clickBtn');
    const badge = document.getElementById('counter');
    btn.addEventListener('click', () => {
      count++;
      badge.textContent = 'Clicks: ' + count + ' 🎉';
      btn.style.transform = 'scale(0.95)';
      setTimeout(() => btn.style.transform = '', 100);
    });
  </script>
</body>
</html>
`
  },
  css: {
    id: 'css',
    name: 'CSS',
    extension: () => css(),
    fileExt: 'css',
    isRunnable: false,
    canWebPreview: false,
    defaultCode: `/* CSS Stylesheet */
.container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  padding: 2rem;
}

.card {
  border-radius: 12px;
  background: #1e293b;
  padding: 1.5rem;
  transition: transform 0.2s ease;
}
`
  },
  json: {
    id: 'json',
    name: 'JSON',
    extension: () => json(),
    fileExt: 'json',
    isRunnable: false,
    canWebPreview: false,
    defaultCode: `{
  "project": "LiveCodeShare",
  "realtime": true,
  "collaborative": true,
  "supportedDevices": ["Laptop", "Tablet", "Phone"],
  "features": [
    "Multi-user synchronization",
    "Code runner with 50+ languages",
    "Live HTML/CSS Web Preview",
    "QR code instant device onboarding",
    "Built-in live chat"
  ]
}
`
  },
  sql: {
    id: 'sql',
    name: 'SQL (SQLite)',
    extension: () => sql(),
    fileExt: 'sql',
    isRunnable: true,
    canWebPreview: false,
    defaultCode: `-- SQL Playground
CREATE TABLE developers (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  device TEXT NOT NULL,
  role TEXT
);

INSERT INTO developers (name, device, role) VALUES 
  ('Jay', 'Laptop', 'Full Stack'),
  ('Priya', 'iPad', 'Frontend'),
  ('Dev', 'Android Phone', 'DevOps');

SELECT * FROM developers WHERE device != 'Desktop';
`
  },
  php: {
    id: 'php',
    name: 'PHP',
    extension: () => php(),
    fileExt: 'php',
    isRunnable: true,
    canWebPreview: false,
    defaultCode: `<?php
// LiveCodeShare PHP Runner
$greeting = "Welcome to live PHP collaboration!";
echo $greeting . "\\n";

$fruits = ["Apple", "Banana", "Cherry", "Date"];
foreach ($fruits as $index => $fruit) {
    echo ($index + 1) . ". " . $fruit . "\\n";
}
?>
`
  },
  markdown: {
    id: 'markdown',
    name: 'Markdown',
    extension: () => markdown(),
    fileExt: 'md',
    isRunnable: false,
    canWebPreview: false,
    defaultCode: `# 📝 Live Markdown Notes

Collaborate on notes, documentation, and ideas in real-time.

## Key Features
- **Real-Time Sync**: Type together without conflicts
- **Any Device**: Works seamlessly on phone, tablet, or PC
- **Private Rooms**: Join via custom Room ID or instant QR Code
`
  }
};
