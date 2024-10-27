# Authentication API Routes

This section describes the authentication-related API routes under `/auth`. These routes handle user sign-ups, logins, token handling, and OTP (One-Time Password) verification.

### 1. `/auth`

- **Method**: `GET`
- **Description**: This route checks if the server is running.
- **Response**:
  - Status `200`: 
    ```json
    {
      "success": true,
      "message": "Server running"
    }
    ```

### 2. `/auth/business-sign-up`

- **Method**: `POST`
- **Description**: Allows business owners to create a new business account and user.
- **Request Body**:
  - `name`: User's full name
  - `email`: User's email
  - `password`: User's password
  - `business_name`: Name of the business to register
- **Response**:
  - Status `201`: 
    ```json
    {
      "success": true,
      "message": "Success"
    }
    ```
  - Status `400`: 
    ```json
    {
      "success": false,
      "message": "name, email, password, or business_name were missing from request body"
    }
    ```
  - Status `409`: 
    ```json
    {
      "success": false,
      "message": "User or business already exists"
    }
    ```
  - Status `500`: 
    ```json
    {
      "success": false,
      "message": "Internal server error"
    }
    ```

### 3. `/auth/sign-up`

- **Method**: `POST`
- **Description**: Allows users to sign up under an existing business.
- **Request Body**:
  - `name`: User's full name
  - `email`: User's email
  - `password`: User's password
  - `business_name`: Name of the business the user is signing up for
  - `role`: User's role in the business
- **Response**:
  - Status `201`: 
    ```json
    {
      "success": true,
      "message": "Success"
    }
    ```
  - Status `400`: 
    ```json
    {
      "success": false,
      "message": "email, password, business_name, or role were missing from request body"
    }
    ```
  - Status `409`: 
    ```json
    {
      "success": false,
      "message": "User already exists"
    }
    ```
  - Status `500`: 
    ```json
    {
      "success": false,
      "message": "Internal server error"
    }
    ```

### 4. `/auth/login`

- **Method**: `POST`
- **Description**: Authenticates a user and logs them in.
- **Request Body**:
  - `email`: User's email
  - `password`: User's password
- **Response**:
  - Status `201`: 
    ```json
    {
      "success": true,
      "message": "Success"
    }
    ```
  - Status `400`: 
    ```json
    {
      "success": false,
      "message": "email or password were missing from request body"
    }
    ```
  - Status `404`: 
    ```json
    {
      "success": false,
      "message": "User does not exist"
    }
    ```
  - Status `401`: 
    ```json
    {
      "success": false,
      "message": "Invalid credentials"
    }
    ```
  - Status `500`: 
    ```json
    {
      "success": false,
      "message": "Internal server error"
    }
    ```

### 5. `/auth/decode-token`

- **Method**: `GET`
- **Description**: Decodes and verifies the authentication token from cookies.
- **Response**:
  - Status `200`: 
    ```json
    {
      "success": true,
      "message": "Token is valid",
      "decoded": decoded
    }
    ```
  - Status `401`: 
    ```json
    {
      "success": false,
      "message": "Token not found"
    }
    ```
  - Status `403`: 
    ```json
    {
      "success": false,
      "message": "Invalid token"
    }
    ```
  - Status `500`: 
    ```json
    {
      "success": false,
      "message": "Internal server error"
    }
    ```

### 6. `/auth/otp/qr-code`

- **Method**: `GET`
- **Description**: Generates a QR code for enabling OTP (One-Time Password) authentication.
- **Response**:
  - Status `200`: 
    ```json
    {
      "success": true,
      "message": "QR Code successfully created",
      "QRCode": QRCode
    }
    ```
  - Status `403`: 
    ```json
    {
      "success": false,
      "message": "Unauthorized"
    }
    ```
  - Status `404`: 
    ```json
    {
      "success": false,
      "message": "User does not exist"
    }
    ```
  - Status `500`: 
    ```json
    {
      "success": false,
      "message": "Internal server error"
    }
    ```

### 7. `/auth/otp/verify-code`

- **Method**: `POST`
- **Description**: Verifies an OTP code.
- **Request Body**:
  - `email`: User's email
  - `code`: OTP code
- **Response**:
  - Status `200`: 
    ```json
    {
      "success": true,
      "message": "The provided code is correct"
    }
    ```
  - Status `400`: 
    ```json
    {
      "success": false,
      "message": "email or OTPCode missing from request body"
    }
    ```
  - Status `403`: 
    ```json
    {
      "success": false,
      "message": "The provided code is incorrect"
    }
    ```
  - Status `404`: 
    ```json
    {
      "success": false,
      "message": "User does not exist"
    }
    ```
  - Status `500`: 
    ```json
    {
      "success": false,
      "message": "Internal server error"
    }
    ```

### 8. `/auth/login-link`

- **Method**: `GET`
- **Description**: Accepts a token and sets a cookie for login purposes.
- **Query Parameters**:
  - `token`: Authentication token
- **Response**:
  - Status `200`: 
    ```json
    {
      "success": true,
      "message": "Token accepted"
    }
    ```
  - Status `400`: 
    ```json
    {
      "success": false,
      "message": "No token was provided"
    }
    ```
  - Status `401`: 
    ```json
    {
      "success": false,
      "message": "Invalid token"
    }
    ```
  - Status `500`: 
    ```json
    {
      "success": false,
      "message": "Internal server error"
    }
    ```

### 9. `/auth/send-login-link`

- **Method**: `POST`
- **Description**: Sends an email with a login link.
- **Request Body**:
  - `email`: User's email
- **Response**:
  - Status `200`: 
    ```json
    {
      "success": true,
      "message": "Login link sent successfully"
    }
    ```
  - Status `400`: 
    ```json
    {
      "success": false,
      "message": "email missing from request body"
    }
    ```
  - Status `500`: 
    ```json
    {
      "success": false,
      "message": "Failed to send login link"
    }
    ```
    
### 10. `/auth/logout`

- **Method**: `POST`
- **Description**: Logs out the user by clearing the authentication cookie.
- **Response**:
  - Status `200`: 
    ```json
    {
      "success": true,
      "message": "Logged out successfully"
    }
    ```
  - Status `500`: 
    ```json
    {
      "success": false,
      "message": "Internal server error: [error message]"
    }
    ```

  ### 11. `/auth/forgot-password`

- **Method**: `POST`
- **Description**: Sends a password reset email to the specified email address.
- **Request Body**:
  - `email`: User's email
- **Response**:
  - **Status `200`**: 
    ```json
    {
      "success": true,
      "message": "Reset password email sent successfully"
    }
    ```
  - **Status `400`**: 
    ```json
    {
      "success": false,
      "message": "email missing from request body"
    }
    ```
  - **Status `500`**: 
    ```json
    {
      "success": false,
      "message": "Internal server error: [error message]"
    }
    ``` 

# Business API Routes

This section describes the business-related API routes under `/business`. These routes handle employee management and business name updates for authorized users.

### 1. `/business/get-employees`

- **Method**: `GET`
- **Description**: Retrieves the list of employees for a specific business.
- **Query Parameters**:
  - `business_name`: The name of the business whose employees you want to retrieve.
- **Response**:
  - Status `200`: 
    ```json
    {
      "success": true,
      "message": "Employees successfully retrieved",
      "employees": [...]
    }
    ```
  - Status `200` (No Employees Found): 
    ```json
    {
      "success": true,
      "message": "No employees were found",
      "employees": []
    }
    ```
  - Status `400`: 
    ```json
    {
      "success": false,
      "message": "Name of business was not provided"
    }
    ```
  - Status `403`: 
    ```json
    {
      "success": false,
      "message": "Unauthorized"
    }
    ```


### 2. `/business/update-business-name`

- **Method**: `PUT`
- **Description**: Updates the name of a business.
- **Request Body**:
  - `business_name`: The current name of the business.
  - `new_name`: The new name for the business.
- **Response**:
  - Status `200`: 
    ```json
    {
      "success": true,
      "message": "Business name updated for all employees"
    }
    ```
  - Status `400`: 
    ```json
    {
      "success": false,
      "message": "business_name or new_name were missing from request body"
    }
    ```
  - Status `403`: 
    ```json
    {
      "success": false,
      "message": "Unauthorized to change name this business"
    }
    ```

### 3. `/business/update-employee-role`

- **Method**: `PUT`
- **Description**: Updates the role of an employee in a business.
- **Request Body**:
  - `email`: The email of the employee whose role is to be updated.
  - `role`: The new role for the employee.
  - `business_name`: The name of the business.
- **Response**:
  - Status `200`: 
    ```json
    {
      "success": true,
      "message": "Role updated successfully"
    }
    ```
  - Status `400`: 
    ```json
    {
      "success": false,
      "message": "email, role, or business_name missing from request body"
    }
    ```
  - Status `403`: 
    ```json
    {
      "success": false,
      "message": "Unauthorized to update employee roles from this business"
    }
    ```
  - Status `404`: 
    ```json
    {
      "success": false,
      "message": "User does not exist"
    }
    ```

### 4. `/business/terminate-employee`

- **Method**: `PUT`
- **Description**: Terminates an employee from a business.
- **Request Body**:
  - `email`: The email of the employee to be terminated.
  - `business_name`: The name of the business.
- **Response**:
  - Status `200`: 
    ```json
    {
      "success": true,
      "message": "Employee successfully terminated"
    }
    ```
  - Status `400`: 
    ```json
    {
      "success": false,
      "message": "email or business_name missing from request body"
    }
    ```
  - Status `403`: 
    ```json
    {
      "success": false,
      "message": "Unauthorized to terminate employees from this business"
    }
    ```

### 5. `/business/add-phone-number`

- **Method**: `PUT`
- **Description**: Adds a phone number to a business's phone number array.
- **Request Body**:
  - `business_name`: The name of the business.
  - `phone_number`: The phone number to add.
- **Response**:
  - Status `200`: 
    ```json
    {
      "success": true,
      "message": "Phone number successfully added"
    }
    ```
  - Status `400`: 
    ```json
    {
      "success": false,
      "message": "phone_number or business_name missing from request body"
    }
    ```
  - Status `403`: 
    ```json
    {
      "success": false,
      "message": "Unauthorized to perform actions on this business"
    }
    ```
  - Status `500`: 
    ```json
    {
      "success": false,
      "message": "Internal server error"
    }
    ```

### 6. `/business/delete-phone-number`

- **Method**: `DELETE`
- **Description**: Deletes a phone number from a specific business's phone numbers list.
- **Request Body**:
  - `business_name`: The name of the business from which the phone number should be deleted.
  - `phone_number`: The phone number to be deleted.
- **Response**:
  - Status `200`: 
    ```json
    {
      "success": true,
      "message": "Phone number successfully deleted"
    }
    ```
  - Status `400`: 
    ```json
    {
      "success": false,
      "message": "business_name or phone_number missing from request body"
    }
    ```
  - Status `403`: 
    ```json
    {
      "success": false,
      "message": "Unauthorized to perform actions on this business"
    }
    ```
  - Status `404`: 
    ```json
    {
      "success": false,
      "message": "Phone number not found for this business"
    }
    ```
  - Status `500`: 
    ```json
    {
      "success": false,
      "message": "Internal server error: <error message>"
    }
    ```



# User API Routes

This section describes the user-related API routes under `/user`. These routes handle account management tasks such as account deletion.

### 1. `/user/delete-account`

- **Method**: `DELETE`
- **Description**: Deletes a user account.
- **Request Body**:
  - `email`: The email of the account to be deleted.
- **Response**:
  - Status `200`: 
    ```json
    {
      "success": true,
      "message": "Account successfully deleted"
    }
    ```
  - Status `400`: 
    ```json
    {
      "success": false,
      "message": "Failed to delete account"
    }
    ```
  - Status `403`: 
    ```json
    {
      "success": false,
      "message": "Unauthorized"
    }
    ```

  ### 2. `/user/update-name`

- **Method**: `PUT`
- **Description**: Updates the user's name in their account profile.
- **Request Body**:
  - `email`: The email of the user whose name is to be updated.
  - `name`: The new name to set for the user.
- **Response**:
  - Status `200`: 
    ```json
    {
      "success": true,
      "message": "Name successfully updated"
    }
    ```
  - Status `400`: 
    ```json
    {
      "success": false,
      "message": "Failed to update name"
    }
    ```
  - Status `403`: 
    ```json
    {
      "success": false,
      "message": "Unauthorized"
    }
    ```
  - Status `500`: 
    ```json
    {
      "success": false,
      "message": "Internal server error: [error details]"
    }
    ```
### 3. `/user/update-email`

- **Method**: `PUT`
- **Description**: Updates the user's email in both their personal account profile and within a specified business's employee list.
- **Request Body**:
  - `business_name`: The name of the business where the user is listed as an employee.
  - `email`: The current email of the user to be updated.
  - `newEmail`: The new email to set for the user.
- **Response**:
  - Status `200`: 
    ```json
    {
      "success": true,
      "message": "Email successfully updated"
    }
    ```
  - Status `400`: 
    ```json
    {
      "success": false,
      "message": "Failed to update email"
    }
    ```
  - Status `403`: 
    ```json
    {
      "success": false,
      "message": "Unauthorized"
    }
    ```
  - Status `500`: 
    ```json
    {
      "success": false,
      "message": "Internal server error: [error details]"
    }
    ```