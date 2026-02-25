# Contributing to RevOps

First off, thank you for considering contributing to RevOps! It's people like you that make RevOps such a great tool.

## Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the issue list as you might find out that you don't need to create one. When you are creating a bug report, please include as many details as possible:

* **Use a clear and descriptive title**
* **Describe the exact steps to reproduce the problem**
* **Provide specific examples**
* **Describe the behavior you observed and what you expected**
* **Include screenshots if possible**
* **Include your environment details** (OS, browser, Node version, Python version)

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. Create an issue and provide:

* **Use a clear and descriptive title**
* **Provide a detailed description of the suggested enhancement**
* **Explain why this enhancement would be useful**
* **List some examples of how it would be used**

### Pull Requests

* Fill in the required template
* Do not include issue numbers in the PR title
* Include screenshots and animated GIFs in your pull request whenever possible
* Follow the Python and JavaScript style guides
* Write clear, descriptive commit messages
* Update documentation as needed
* Add tests for new features

## Development Process

### 1. Fork & Clone

```bash
# Fork the repo on GitHub, then:
git clone https://github.com/your-username/revops-garage-management.git
cd revops-garage-management
```

### 2. Create a Branch

```bash
git checkout -b feature/amazing-feature
# or
git checkout -b fix/bug-description
```

### 3. Setup Development Environment

**Backend:**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your MongoDB URL
```

**Frontend:**
```bash
cd frontend
yarn install
cp .env.example .env
# Edit .env with your backend URL
```

### 4. Make Your Changes

* Write clean, readable code
* Follow existing code style
* Comment complex logic
* Add tests for new features
* Update documentation

### 5. Test Your Changes

**Backend:**
```bash
cd backend
pytest
```

**Frontend:**
```bash
cd frontend
yarn test
```

**Manual Testing:**
```bash
# Backend
cd backend
uvicorn server:app --reload

# Frontend (in another terminal)
cd frontend
yarn start
```

### 6. Commit Your Changes

```bash
git add .
git commit -m "feat: add amazing feature"
```

**Commit Message Format:**
```
<type>: <subject>

<body>

<footer>
```

**Types:**
* `feat`: New feature
* `fix`: Bug fix
* `docs`: Documentation changes
* `style`: Code style changes (formatting, etc.)
* `refactor`: Code refactoring
* `test`: Adding tests
* `chore`: Maintenance tasks

**Example:**
```
feat: add WhatsApp integration for job cards

- Integrate WhatsApp Business API
- Add send button in job detail page
- Update environment variables documentation

Closes #123
```

### 7. Push & Create Pull Request

```bash
git push origin feature/amazing-feature
```

Then go to GitHub and create a Pull Request.

## Style Guides

### Python Style Guide

* Follow [PEP 8](https://www.python.org/dev/peps/pep-0008/)
* Use type hints
* Use async/await for I/O operations
* Maximum line length: 100 characters
* Use descriptive variable names

**Example:**
```python
async def get_jobs(
    workshop_id: str,
    status: Optional[str] = None,
    limit: int = 100
) -> List[Dict[str, Any]]:
    """Get jobs for a workshop.
    
    Args:
        workshop_id: Workshop UUID
        status: Optional job status filter
        limit: Maximum number of jobs to return
        
    Returns:
        List of job dictionaries
    """
    query = {"workshop_id": workshop_id}
    if status:
        query["status"] = status
    
    jobs = await db.jobs.find(query, {"_id": 0}).limit(limit).to_list(limit)
    return jobs
```

### JavaScript/React Style Guide

* Use functional components with hooks
* Use ES6+ features
* Use descriptive component and variable names
* Use PropTypes or TypeScript for type checking
* Maximum line length: 100 characters

**Example:**
```javascript
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { jobAPI } from '@/services/api';

export const JobsList = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const response = await jobAPI.getAll();
      setJobs(response.data);
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-4">
      {jobs.map(job => (
        <JobCard key={job.id} job={job} />
      ))}
    </div>
  );
};
```

### CSS/Tailwind Style Guide

* Use Tailwind utility classes
* Create reusable components for complex styles
* Use design tokens from design_guidelines.json
* Mobile-first responsive design

## Testing Guidelines

### Backend Tests

```python
import pytest
from fastapi.testclient import TestClient
from server import app

client = TestClient(app)

def test_create_job():
    # Setup
    token = get_test_token()
    
    # Execute
    response = client.post(
        "/api/jobs",
        json={"customer_name": "Test Customer", ...},
        headers={"Authorization": f"Bearer {token}"}
    )
    
    # Assert
    assert response.status_code == 200
    assert "id" in response.json()
```

### Frontend Tests

```javascript
import { render, screen, fireEvent } from '@testing-library/react';
import { JobsList } from './JobsList';

test('renders job list', async () => {
  render(<JobsList />);
  
  // Wait for loading to finish
  await screen.findByText(/Test Job/);
  
  // Assert
  expect(screen.getByText('Test Job')).toBeInTheDocument();
});
```

## Documentation

* Update README.md for new features
* Update ARCHITECTURE.md for architectural changes
* Add JSDoc comments for complex functions
* Update API documentation in FastAPI (docstrings)

## Questions?

Feel free to create an issue with the label "question" or reach out to the maintainers.

## Recognition

Contributors will be recognized in:
* README.md Contributors section
* Release notes
* Our project website

Thank you for contributing to RevOps! 🚀
