#!/usr/bin/env node
/**
 * HTML Report Generator for E2E Test Results
 * 
 * Reads e2e-results.json and generates a professional HTML report
 */

import fs from 'fs'
import path from 'path'

interface TestResult {
  name: string
  passed: boolean
  error?: string
  duration: number
  endpoint?: string
  method?: string
}

interface TestSummary {
  total: number
  passed: number
  failed: number
  passRate: string
}

interface TestResults {
  timestamp: string
  summary: TestSummary
  tests: TestResult[]
}

const resultsPath = path.join(process.cwd(), 'reports', 'e2e-results.json')
const outputPath = path.join(process.cwd(), 'reports', 'e2e-report.html')

// Check if results file exists
if (!fs.existsSync(resultsPath)) {
  console.error('Error: e2e-results.json not found. Please run E2E tests first.')
  process.exit(1)
}

// Read test results
const results: TestResults = JSON.parse(fs.readFileSync(resultsPath, 'utf-8'))

// Group tests by category
const groupedTests: Record<string, TestResult[]> = {}

results.tests.forEach((test) => {
  let category = 'General'
  
  if (test.name.includes('Register') || test.name.includes('Login') || test.name.includes('duplicate')) {
    category = 'Authentication'
  } else if (test.name.includes('user') && !test.name.includes('protocol') && !test.name.includes('other')) {
    category = 'User Management'
  } else if (test.name.includes('protocol')) {
    category = 'Protocols'
  } else if (test.name.includes('hazard') || test.name.includes('zone')) {
    category = 'Hazard Zones'
  } else if (test.name.includes('compliance') || test.name.includes('log')) {
    category = 'Compliance Logs'
  } else if (test.name.includes('Cleanup') || test.name.includes('Delete')) {
    category = 'Cleanup'
  } else if (test.name.includes('Health')) {
    category = 'Health Check'
  }
  
  if (!groupedTests[category]) {
    groupedTests[category] = []
  }
  groupedTests[category].push(test)
})

// Calculate category statistics
const categoryStats: Record<string, { total: number; passed: number; failed: number }> = {}
Object.keys(groupedTests).forEach((category) => {
  const tests = groupedTests[category]
  categoryStats[category] = {
    total: tests.length,
    passed: tests.filter((t) => t.passed).length,
    failed: tests.filter((t) => !t.passed).length,
  }
})

// Generate HTML
const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SafeSite API - E2E Test Report</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px;
      min-height: 100vh;
    }
    
    .container {
      max-width: 1200px;
      margin: 0 auto;
      background: white;
      border-radius: 12px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      overflow: hidden;
    }
    
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 40px;
      text-align: center;
    }
    
    .header h1 {
      font-size: 2.5em;
      margin-bottom: 10px;
      font-weight: 700;
    }
    
    .header p {
      font-size: 1.1em;
      opacity: 0.9;
    }
    
    .summary {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      padding: 40px;
      background: #f8f9fa;
    }
    
    .stat-card {
      background: white;
      padding: 25px;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      text-align: center;
      transition: transform 0.2s;
    }
    
    .stat-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }
    
    .stat-card h3 {
      font-size: 0.9em;
      color: #6c757d;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 10px;
    }
    
    .stat-card .value {
      font-size: 2.5em;
      font-weight: 700;
      margin-bottom: 5px;
    }
    
    .stat-card.total .value { color: #667eea; }
    .stat-card.passed .value { color: #10b981; }
    .stat-card.failed .value { color: #ef4444; }
    .stat-card.rate .value { color: #f59e0b; }
    
    .categories {
      padding: 40px;
    }
    
    .category {
      margin-bottom: 40px;
    }
    
    .category-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 15px 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border-radius: 8px;
      margin-bottom: 15px;
      cursor: pointer;
      transition: all 0.3s;
    }
    
    .category-header:hover {
      transform: translateX(5px);
    }
    
    .category-header h2 {
      font-size: 1.3em;
      font-weight: 600;
    }
    
    .category-badge {
      display: flex;
      gap: 15px;
      font-size: 0.9em;
    }
    
    .badge {
      padding: 4px 12px;
      border-radius: 12px;
      background: rgba(255, 255, 255, 0.2);
      font-weight: 600;
    }
    
    .test-list {
      list-style: none;
    }
    
    .test-item {
      padding: 15px 20px;
      border-left: 4px solid transparent;
      margin-bottom: 8px;
      background: #f8f9fa;
      border-radius: 4px;
      transition: all 0.2s;
    }
    
    .test-item:hover {
      background: #e9ecef;
      transform: translateX(5px);
    }
    
    .test-item.passed {
      border-left-color: #10b981;
    }
    
    .test-item.failed {
      border-left-color: #ef4444;
      background: #fee;
    }
    
    .test-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 5px;
    }
    
    .test-name {
      font-weight: 600;
      color: #1f2937;
      flex: 1;
    }
    
    .test-meta {
      display: flex;
      gap: 15px;
      align-items: center;
      font-size: 0.85em;
      color: #6c757d;
    }
    
    .status {
      font-weight: 700;
      padding: 2px 8px;
      border-radius: 4px;
    }
    
    .status.passed {
      color: #10b981;
      background: #d1fae5;
    }
    
    .status.failed {
      color: #ef4444;
      background: #fee2e2;
    }
    
    .endpoint {
      font-family: 'Courier New', monospace;
      background: #e9ecef;
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 0.85em;
    }
    
    .error-message {
      color: #dc2626;
      font-size: 0.9em;
      margin-top: 8px;
      padding: 10px;
      background: #fee;
      border-radius: 4px;
      font-family: 'Courier New', monospace;
    }
    
    .footer {
      padding: 20px 40px;
      background: #f8f9fa;
      text-align: center;
      color: #6c757d;
      font-size: 0.9em;
    }
    
    .timestamp {
      margin-top: 10px;
      font-weight: 600;
    }
    
    @media print {
      body {
        background: white;
        padding: 0;
      }
      
      .container {
        box-shadow: none;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🛡️ SafeSite API</h1>
      <p>End-to-End Test Report</p>
    </div>
    
    <div class="summary">
      <div class="stat-card total">
        <h3>Total Tests</h3>
        <div class="value">${results.summary.total}</div>
      </div>
      
      <div class="stat-card passed">
        <h3>Passed</h3>
        <div class="value">${results.summary.passed}</div>
      </div>
      
      <div class="stat-card failed">
        <h3>Failed</h3>
        <div class="value">${results.summary.failed}</div>
      </div>
      
      <div class="stat-card rate">
        <h3>Pass Rate</h3>
        <div class="value">${results.summary.passRate}</div>
      </div>
    </div>
    
    <div class="categories">
      ${Object.keys(groupedTests)
        .map(
          (category) => `
        <div class="category">
          <div class="category-header">
            <h2>${category}</h2>
            <div class="category-badge">
              <span class="badge">${categoryStats[category].total} tests</span>
              <span class="badge">✓ ${categoryStats[category].passed}</span>
              ${categoryStats[category].failed > 0 ? `<span class="badge">✗ ${categoryStats[category].failed}</span>` : ''}
            </div>
          </div>
          
          <ul class="test-list">
            ${groupedTests[category]
              .map(
                (test) => `
              <li class="test-item ${test.passed ? 'passed' : 'failed'}">
                <div class="test-header">
                  <span class="test-name">${test.name}</span>
                  <div class="test-meta">
                    ${test.endpoint ? `<span class="endpoint">${test.method || 'GET'} ${test.endpoint}</span>` : ''}
                    <span class="status ${test.passed ? 'passed' : 'failed'}">
                      ${test.passed ? '✓ PASS' : '✗ FAIL'}
                    </span>
                    <span>${test.duration}ms</span>
                  </div>
                </div>
                ${test.error ? `<div class="error-message">❌ ${test.error}</div>` : ''}
              </li>
            `
              )
              .join('')}
          </ul>
        </div>
      `
        )
        .join('')}
    </div>
    
    <div class="footer">
      <p>Generated by SafeSite E2E Test Runner</p>
      <p class="timestamp">Test executed on: ${new Date(results.timestamp).toLocaleString()}</p>
    </div>
  </div>
</body>
</html>
`

// Write HTML file
fs.writeFileSync(outputPath, html, 'utf-8')

console.log(`✓ HTML report generated: ${outputPath}`)
console.log(`  Open it in your browser to view the detailed results.`)
