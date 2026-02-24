#!/usr/bin/env python3
"""
Comprehensive Backend API Testing for Garage Management System (RevOps)
Tests all CRUD operations, authentication, role-based access, and document generation
"""

import requests
import sys
import json
from datetime import datetime
import os
from pathlib import Path

# Get the public API endpoint from frontend .env
def get_api_base_url():
    env_path = Path(__file__).parent / "frontend" / ".env"
    if env_path.exists():
        with open(env_path, 'r') as f:
            for line in f:
                if line.startswith('REACT_APP_BACKEND_URL='):
                    return line.split('=', 1)[1].strip()
    return "http://localhost:8001"

class GarageAPITester:
    def __init__(self):
        self.base_url = f"{get_api_base_url()}/api"
        self.session = requests.Session()
        self.owner_token = None
        self.manager_token = None
        self.workshop_id = None
        self.invite_code = None
        self.job_id = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []
        
        # Test data
        timestamp = datetime.now().strftime("%H%M%S")
        self.owner_data = {
            "email": f"owner_{timestamp}@test.com",
            "password": "TestOwner123!",
            "name": f"Test Owner {timestamp}",
            "phone": "+91 9876543210",
            "role": "owner"
        }
        
        self.manager_data = {
            "email": f"manager_{timestamp}@test.com", 
            "password": "TestManager123!",
            "name": f"Test Manager {timestamp}",
            "phone": "+91 9876543211",
            "role": "manager"
        }
        
        self.workshop_data = {
            "name": f"Test Garage {timestamp}",
            "address": "123 Test Street, Test City",
            "phone": "+91 9876543212",
            "gst_number": "22AAAAA0000A1Z5"
        }
        
        self.job_data = {
            "customer_name": "Test Customer",
            "phone": "+91 9876543213",
            "car_model": "Maruti Swift",
            "vehicle_number": "MH01AB1234",
            "work_description": "Engine service and oil change",
            "estimated_amount": 5000.0,
            "advance_paid": 1000.0,
            "planned_completion_days": 2,
            "parts_required": "Engine oil, oil filter",
            "worker_assigned": "Ramesh",
            "internal_notes": "Customer prefers synthetic oil"
        }

    def log_test(self, name, success, message="", response_data=None):
        """Log test results"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            status = "✅ PASS"
        else:
            status = "❌ FAIL"
        
        print(f"{status} {name}: {message}")
        
        self.test_results.append({
            "name": name,
            "success": success,
            "message": message,
            "response_data": response_data
        })

    def make_request(self, method, endpoint, data=None, use_owner_token=False, use_manager_token=False):
        """Make API request with proper headers"""
        url = f"{self.base_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}
        
        if use_owner_token and self.owner_token:
            headers['Authorization'] = f'Bearer {self.owner_token}'
        elif use_manager_token and self.manager_token:
            headers['Authorization'] = f'Bearer {self.manager_token}'
            
        try:
            if method.upper() == 'GET':
                response = self.session.get(url, headers=headers)
            elif method.upper() == 'POST':
                response = self.session.post(url, json=data, headers=headers)
            elif method.upper() == 'PUT':
                response = self.session.put(url, json=data, headers=headers)
            elif method.upper() == 'DELETE':
                response = self.session.delete(url, headers=headers)
            else:
                raise ValueError(f"Unsupported method: {method}")
                
            return response
        except Exception as e:
            print(f"Request failed: {str(e)}")
            return None

    def test_owner_registration(self):
        """Test owner registration"""
        response = self.make_request('POST', 'auth/register', self.owner_data)
        if response and response.status_code == 200:
            data = response.json()
            self.owner_token = data.get('token')
            self.log_test("Owner Registration", True, f"Owner registered with ID: {data.get('user', {}).get('id')}")
            return True
        else:
            error_msg = response.json().get('detail', 'Unknown error') if response else 'No response'
            self.log_test("Owner Registration", False, f"Status: {response.status_code if response else 'None'}, Error: {error_msg}")
            return False

    def test_workshop_creation(self):
        """Test workshop creation"""
        if not self.owner_token:
            self.log_test("Workshop Creation", False, "No owner token available")
            return False
            
        response = self.make_request('POST', 'workshops', self.workshop_data, use_owner_token=True)
        if response and response.status_code == 200:
            data = response.json()
            self.workshop_id = data.get('id')
            self.log_test("Workshop Creation", True, f"Workshop created with ID: {self.workshop_id}")
            return True
        else:
            error_msg = response.json().get('detail', 'Unknown error') if response else 'No response'
            self.log_test("Workshop Creation", False, f"Status: {response.status_code if response else 'None'}, Error: {error_msg}")
            return False

    def test_invite_code_generation(self):
        """Test invite code generation"""
        if not self.workshop_id:
            self.log_test("Invite Code Generation", False, "No workshop ID available")
            return False
            
        response = self.make_request('POST', f'workshops/{self.workshop_id}/invite-codes', use_owner_token=True)
        if response and response.status_code == 200:
            data = response.json()
            self.invite_code = data.get('code')
            self.log_test("Invite Code Generation", True, f"Invite code generated: {self.invite_code}")
            return True
        else:
            error_msg = response.json().get('detail', 'Unknown error') if response else 'No response'
            self.log_test("Invite Code Generation", False, f"Status: {response.status_code if response else 'None'}, Error: {error_msg}")
            return False

    def test_manager_registration(self):
        """Test manager registration with invite code"""
        if not self.invite_code:
            self.log_test("Manager Registration", False, "No invite code available")
            return False
            
        manager_data = {**self.manager_data, "invite_code": self.invite_code}
        response = self.make_request('POST', 'auth/register', manager_data)
        if response and response.status_code == 200:
            data = response.json()
            self.manager_token = data.get('token')
            self.log_test("Manager Registration", True, f"Manager registered with ID: {data.get('user', {}).get('id')}")
            return True
        else:
            error_msg = response.json().get('detail', 'Unknown error') if response else 'No response'
            self.log_test("Manager Registration", False, f"Status: {response.status_code if response else 'None'}, Error: {error_msg}")
            return False

    def test_login_functionality(self):
        """Test login for both owner and manager"""
        # Test owner login
        login_data = {"email": self.owner_data["email"], "password": self.owner_data["password"]}
        response = self.make_request('POST', 'auth/login', login_data)
        if response and response.status_code == 200:
            self.log_test("Owner Login", True, "Owner login successful")
        else:
            self.log_test("Owner Login", False, f"Login failed: {response.status_code if response else 'No response'}")

        # Test manager login
        login_data = {"email": self.manager_data["email"], "password": self.manager_data["password"]}
        response = self.make_request('POST', 'auth/login', login_data)
        if response and response.status_code == 200:
            self.log_test("Manager Login", True, "Manager login successful")
        else:
            self.log_test("Manager Login", False, f"Login failed: {response.status_code if response else 'No response'}")

    def test_job_creation(self):
        """Test job creation by manager"""
        if not self.manager_token:
            self.log_test("Job Creation", False, "No manager token available")
            return False
            
        response = self.make_request('POST', 'jobs', self.job_data, use_manager_token=True)
        if response and response.status_code == 200:
            data = response.json()
            self.job_id = data.get('id')
            self.log_test("Job Creation", True, f"Job created with ID: {self.job_id}")
            return True
        else:
            error_msg = response.json().get('detail', 'Unknown error') if response else 'No response'
            self.log_test("Job Creation", False, f"Status: {response.status_code if response else 'None'}, Error: {error_msg}")
            return False

    def test_job_retrieval(self):
        """Test job retrieval by owner and manager"""
        if not self.job_id:
            self.log_test("Job Retrieval", False, "No job ID available")
            return False

        # Test manager can view their job
        response = self.make_request('GET', f'jobs/{self.job_id}', use_manager_token=True)
        if response and response.status_code == 200:
            self.log_test("Manager Job View", True, "Manager can view their job")
        else:
            self.log_test("Manager Job View", False, f"Failed to retrieve job: {response.status_code if response else 'No response'}")

        # Test owner can view all jobs
        response = self.make_request('GET', 'jobs', use_owner_token=True)
        if response and response.status_code == 200:
            jobs = response.json()
            self.log_test("Owner Jobs List", True, f"Owner can view {len(jobs)} jobs")
        else:
            self.log_test("Owner Jobs List", False, f"Failed to retrieve jobs: {response.status_code if response else 'No response'}")

    def test_payment_recording(self):
        """Test payment recording by manager"""
        if not self.job_id or not self.manager_token:
            self.log_test("Payment Recording", False, "No job ID or manager token available")
            return False

        payment_data = {
            "job_id": self.job_id,
            "amount": 2000.0,
            "payment_type": "partial",
            "notes": "Partial payment received"
        }
        
        response = self.make_request('POST', 'payments', payment_data, use_manager_token=True)
        if response and response.status_code == 200:
            self.log_test("Payment Recording", True, "Payment recorded successfully")
            return True
        else:
            error_msg = response.json().get('detail', 'Unknown error') if response else 'No response'
            self.log_test("Payment Recording", False, f"Status: {response.status_code if response else 'None'}, Error: {error_msg}")
            return False

    def test_payment_confirmation(self):
        """Test payment confirmation by owner"""
        if not self.owner_token:
            self.log_test("Payment Confirmation", False, "No owner token available")
            return False

        # Get payments first
        response = self.make_request('GET', 'payments?confirmed=false', use_owner_token=True)
        if response and response.status_code == 200:
            payments = response.json()
            if payments:
                payment_id = payments[0]['id']
                # Confirm the payment
                response = self.make_request('PUT', f'payments/{payment_id}/confirm', use_owner_token=True)
                if response and response.status_code == 200:
                    self.log_test("Payment Confirmation", True, "Payment confirmed by owner")
                else:
                    self.log_test("Payment Confirmation", False, f"Failed to confirm payment: {response.status_code if response else 'No response'}")
            else:
                self.log_test("Payment Confirmation", False, "No pending payments to confirm")
        else:
            self.log_test("Payment Confirmation", False, "Failed to retrieve payments")

    def test_job_status_update(self):
        """Test job status update by manager"""
        if not self.job_id or not self.manager_token:
            self.log_test("Job Status Update", False, "No job ID or manager token available")
            return False

        update_data = {"status": "in_progress"}
        response = self.make_request('PUT', f'jobs/{self.job_id}', update_data, use_manager_token=True)
        if response and response.status_code == 200:
            self.log_test("Job Status Update", True, "Job status updated successfully")
        else:
            error_msg = response.json().get('detail', 'Unknown error') if response else 'No response'
            self.log_test("Job Status Update", False, f"Status: {response.status_code if response else 'None'}, Error: {error_msg}")

    def test_analytics_dashboard(self):
        """Test analytics dashboard for owner"""
        if not self.owner_token:
            self.log_test("Analytics Dashboard", False, "No owner token available")
            return False

        response = self.make_request('GET', 'analytics/dashboard', use_owner_token=True)
        if response and response.status_code == 200:
            data = response.json()
            required_fields = ['total_jobs', 'total_revenue', 'total_collected', 'status_counts']
            missing_fields = [field for field in required_fields if field not in data]
            
            if not missing_fields:
                self.log_test("Analytics Dashboard", True, f"Analytics loaded: {data['total_jobs']} jobs, ₹{data['total_revenue']} revenue")
            else:
                self.log_test("Analytics Dashboard", False, f"Missing fields: {missing_fields}")
        else:
            error_msg = response.json().get('detail', 'Unknown error') if response else 'No response'
            self.log_test("Analytics Dashboard", False, f"Status: {response.status_code if response else 'None'}, Error: {error_msg}")

    def test_managers_list(self):
        """Test managers list for owner"""
        if not self.owner_token:
            self.log_test("Managers List", False, "No owner token available")
            return False

        response = self.make_request('GET', 'managers', use_owner_token=True)
        if response and response.status_code == 200:
            managers = response.json()
            self.log_test("Managers List", True, f"Retrieved {len(managers)} managers")
        else:
            error_msg = response.json().get('detail', 'Unknown error') if response else 'No response'
            self.log_test("Managers List", False, f"Status: {response.status_code if response else 'None'}, Error: {error_msg}")

    def test_document_generation(self):
        """Test PDF document generation"""
        if not self.job_id:
            self.log_test("Document Generation", False, "No job ID available")
            return False

        # Test job card generation
        response = self.make_request('GET', f'documents/job-card/{self.job_id}', use_manager_token=True)
        if response and response.status_code == 200:
            self.log_test("Job Card Generation", True, f"Job card PDF generated ({len(response.content)} bytes)")
        else:
            self.log_test("Job Card Generation", False, f"Failed to generate job card: {response.status_code if response else 'No response'}")

        # Test invoice generation
        response = self.make_request('GET', f'documents/invoice/{self.job_id}', use_manager_token=True)
        if response and response.status_code == 200:
            self.log_test("Invoice Generation", True, f"Invoice PDF generated ({len(response.content)} bytes)")
        else:
            self.log_test("Invoice Generation", False, f"Failed to generate invoice: {response.status_code if response else 'No response'}")

    def test_excel_export(self):
        """Test Excel export functionality"""
        if not self.owner_token:
            self.log_test("Excel Export", False, "No owner token available")
            return False

        response = self.make_request('GET', 'analytics/export', use_owner_token=True)
        if response and response.status_code == 200:
            self.log_test("Excel Export", True, f"Excel file exported ({len(response.content)} bytes)")
        else:
            error_msg = response.json().get('detail', 'Unknown error') if response else 'No response'
            self.log_test("Excel Export", False, f"Status: {response.status_code if response else 'None'}, Error: {error_msg}")

    def test_role_based_access(self):
        """Test role-based access control"""
        # Test manager trying to access owner-only endpoints
        if self.manager_token:
            response = self.make_request('GET', 'analytics/dashboard', use_manager_token=True)
            if response and response.status_code == 403:
                self.log_test("Manager Access Control", True, "Manager correctly denied access to analytics")
            else:
                self.log_test("Manager Access Control", False, f"Manager access control failed: {response.status_code if response else 'No response'}")

        # Test owner accessing manager job creation
        if self.owner_token:
            response = self.make_request('POST', 'jobs', self.job_data, use_owner_token=True)
            if response and response.status_code == 403:
                self.log_test("Owner Access Control", True, "Owner correctly denied job creation access")
            else:
                self.log_test("Owner Access Control", False, f"Owner access control failed: {response.status_code if response else 'No response'}")

    def run_all_tests(self):
        """Run all tests in sequence"""
        print(f"🚀 Starting comprehensive backend API testing for RevOps Garage Management System")
        print(f"📡 API Base URL: {self.base_url}")
        print("=" * 80)

        # Core registration and setup flow
        if not self.test_owner_registration():
            print("❌ Cannot proceed without owner registration")
            return self.generate_report()

        if not self.test_workshop_creation():
            print("❌ Cannot proceed without workshop")
            return self.generate_report()

        if not self.test_invite_code_generation():
            print("❌ Cannot proceed without invite code")
            return self.generate_report()

        if not self.test_manager_registration():
            print("❌ Cannot proceed without manager registration")
            return self.generate_report()

        # Authentication tests
        self.test_login_functionality()

        # Core business logic tests
        if self.test_job_creation():
            self.test_job_retrieval()
            self.test_payment_recording()
            self.test_payment_confirmation()
            self.test_job_status_update()

        # Analytics and management
        self.test_analytics_dashboard()
        self.test_managers_list()

        # Document generation
        self.test_document_generation()
        self.test_excel_export()

        # Security tests
        self.test_role_based_access()

        return self.generate_report()

    def generate_report(self):
        """Generate final test report"""
        print("\n" + "=" * 80)
        print("🎯 BACKEND API TEST RESULTS")
        print("=" * 80)
        
        success_rate = (self.tests_passed / self.tests_run * 100) if self.tests_run > 0 else 0
        
        print(f"✅ Tests Passed: {self.tests_passed}/{self.tests_run} ({success_rate:.1f}%)")
        
        failed_tests = [test for test in self.test_results if not test['success']]
        if failed_tests:
            print(f"\n❌ Failed Tests ({len(failed_tests)}):")
            for test in failed_tests:
                print(f"   • {test['name']}: {test['message']}")

        critical_failures = []
        if not any(test['name'] == 'Owner Registration' and test['success'] for test in self.test_results):
            critical_failures.append("Owner Registration Failed")
        if not any(test['name'] == 'Manager Registration' and test['success'] for test in self.test_results):
            critical_failures.append("Manager Registration Failed")
        if not any(test['name'] == 'Job Creation' and test['success'] for test in self.test_results):
            critical_failures.append("Job Creation Failed")

        if critical_failures:
            print(f"\n🚨 CRITICAL FAILURES: {', '.join(critical_failures)}")
            return 1

        if success_rate < 70:
            print(f"\n⚠️  SUCCESS RATE TOO LOW: {success_rate:.1f}% (minimum 70% required)")
            return 1

        print(f"\n🎉 All tests completed successfully!")
        return 0

def main():
    """Main test execution"""
    tester = GarageAPITester()
    return tester.run_all_tests()

if __name__ == "__main__":
    sys.exit(main())