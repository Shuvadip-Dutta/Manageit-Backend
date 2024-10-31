# Manageit-Backend

Required modules:
npm init
________________________________________
npm install express mongoose mongodb bcrypt jsonwebtoken firebase-admin multer firebase nodemailer crypto socket.io
________________________________________
npm i -g nodemon
________________________________________

To run:
npx nodemon server.js


#API Documentation
________________________________________
#Base URL
http://<your-server-url>/api
Replace <your-api-domain> with your actual domain or localhost.

#userRoutes.js
________________________________________
Authentication
All routes require authentication except for the registration and login endpoints.
Authentication Token
Use the JWT token received upon successful login to access protected routes. The token should be included in the Authorization header as follows:
Authorization: Bearer <token>
Endpoints
1. Send OTP for Registration
•	POST /register/send-otp
________________________________________
Request Body:
json
{
  "email": "user@example.com"
}
Response:
•	200 OK
json
{
  "message": "OTP sent to email.",
  "otp": 123456
}
•	400 Bad Request
json
{
  "error": "User already exists"
}
•	500 Internal Server Error
json
{
  "error": "An error occurred while sending OTP. Please try again later."
}
________________________________________
2. Verify OTP for Registration
•	POST /register/verify-otp
________________________________________
Request Body:
json

{
  "email": "user@example.com",
  "otp": 123456
}
Response:
•	200 OK
json

{
  "message": "OTP verified successfully."
}
•	400 Bad Request
json

{
  "error": "Invalid OTP"
}
•	403 Forbidden
json

{
  "error": "OTP verification required."
}
•	500 Internal Server Error
json

{
  "error": "An error occurred during OTP verification. Please try again later."
}
________________________________________
3. Complete Registration
•	POST /register/complete
________________________________________
Request Body:
json

{
  "email": "user@example.com",
  "name": "John Doe",
  "dob": "1990-01-01",
  "phoneNum": "1234567890",
  "password": "password123",
  "confirmPassword": "password123"
}
Response:
•	201 Created
json

{
  "message": "User registered successfully..."
}
•	400 Bad Request
json

{
  "error": "Passwords do not match."
}
•	403 Forbidden
json

{
  "error": "OTP verification required."
}
•	500 Internal Server Error
json

{
  "error": "An error occurred during registration. Please try again later."
}
________________________________________


4. Login
•	POST /login
________________________________________
Request Body:
json

{
  "email": "user@example.com",
  "password": "password123"
}
Response:
•	200 OK
json

{
  "token": "jwt_token_here"
}
•	400 Bad Request
json

{
  "error": "Invalid email or password"
}
•	500 Internal Server Error
json

{
  "error": "An error occurred during login. Please try again later."
}
________________________________________
5. Get User Profile
•	GET /profile
________________________________________
Response:
•	200 OK
json

{
  "_id": "user_id",
  "name": "John Doe",
  "email": "user@example.com",
  "dob": "1990-01-01",
  "phoneNum": "1234567890"
}
•	404 Not Found
json

{
  "error": "User not found"
}
•	500 Internal Server Error
json

{
  "error": "An error occurred during login. Please try again later."
}
________________________________________
6. Update User Profile
•	PUT /profile
________________________________________
Request Body:
json

{
  "name": "John Doe",
  "email": "newemail@example.com",
  "dob": "1990-01-01",
  "phoneNum": "0987654321"
}
Response:
•	200 OK
json

{
  "message": "Profile updated successfully",
  "user": {
    "_id": "user_id",
    "name": "John Doe",
    "email": "newemail@example.com",
    "dob": "1990-01-01",
    "phoneNum": "0987654321"
  }
}
•	404 Not Found
json

{
  "error": "User not found"
}
•	500 Internal Server Error
json

{
  "error": "An error occurred while updating the profile. Please try again later."
}
________________________________________
7. Logout
•	POST /logout
________________________________________
Response:
•	200 OK
json

{
  "message": "Logged out successful..."
}
•	500 Internal Server Error
json

{
  "error": "An error occurred while logging out the account. Please try again later."
}
________________________________________
8. Delete User Account
•	DELETE /delete
________________________________________
Response:
•	200 OK
json

{
  "message": "User account deleted successfully"
}
•	500 Internal Server Error
json

{
  "error": "An error occurred while deleting the account. Please try again later."
}
________________________________________
9. Send OTP for Forgot Password
•	POST /forgot-password/send-otp
________________________________________
Request Body:
json

{
  "email": "user@example.com"
}
Response:
•	200 OK
json

{
  "message": "OTP sent to email.",
  "otp": 123456
}
•	404 Not Found
json

{
  "error": "User not found"
}
•	500 Internal Server Error
json

{
  "error": "An error occurred while sending OTP. Please try again later."
}
________________________________________
10. Verify OTP for Password Reset
•	POST /reset-password/verify-otp
________________________________________
Request Body:
json

{
  "email": "user@example.com",
  "otp": 123456
}
Response:
•	200 OK
json

{
  "message": "OTP verified successfully. Proceed to change password."
}
•	400 Bad Request
json

{
  "error": "OTP is invalid or has expired."
}
•	500 Internal Server Error
json

{
  "error": "An error occurred during OTP verification. Please try again later."
}
________________________________________
11. Reset Password
•	POST /reset-password/change-password
________________________________________
Request Body:
json

{
  "email": "user@example.com",
  "newPassword": "newpassword123",
  "confirmPassword": "newpassword123"
}
Response:
•	200 OK
json

{
  "message": "Your password has been changed successfully."
}
•	400 Bad Request
json

{
  "error": "Passwords do not match."
}
•	403 Forbidden
json

{
  "error": "OTP verification required."
}
•	500 Internal Server Error
json

{
  "error": "An error occurred while changing the password. Please try again later."
}
________________________________________

#organizationRoutes.js
________________________________________
Authentication
•	All endpoints require a valid JWT token for access.
________________________________________
1. Create Organization
POST /organizations
________________________________________
Description: Creates a new organization.
Request Body:
json

{
  "name": "string",
  "description": "string"
}
Response:
•	201 Created: Successfully created organization.
json

{
  "name": "string",
  "description": "string",
  "admin": "userId",
  "members": ["userId"]
}
•	500 Internal Server Error: Failed to create organization.
________________________________________
2. Get All Organizations
GET /organizations
________________________________________
Description: Retrieves all organizations for the authenticated user.
Response:
•	200 OK: Successfully retrieved organizations.
json

{
  "organizations": [
    {
      "name": "string",
      "description": "string",
      "admin": "userId",
      "members": ["userId"]
    }
  ]
}
•	404 Not Found: No organizations found.
•	500 Internal Server Error: Failed to fetch organizations.
________________________________________
3. Invite User
POST /organizations/:orgId/invite
________________________________________
Description: Sends an invitation to a user to join the organization.
URL Parameters:
•	orgId: The ID of the organization.
Request Body:
json

{
  "userId": "string"
}
Response:
•	201 Created: User invited successfully.
json

{
  "message": "User invited successfully...",
  "invite": {
    "organization": "orgId",
    "invitedBy": "userId",
    "invitee": "userId"
  }
}
•	403 Forbidden: Unauthorized to invite user.
•	400 Bad Request: User already a member or has a pending invite.
•	500 Internal Server Error: Failed to invite user.
________________________________________
4. See All Invites (User)
GET /invites
________________________________________
Description: Retrieves all invites for the authenticated user.
Response:
•	200 OK: Successfully retrieved invites.
json

{
  "invites": [
    {
      "organization": "orgId",
      "invitedBy": "userId",
      "invitee": "userId",
      "status": "pending"
    }
  ]
}
•	404 Not Found: No invites found.
•	500 Internal Server Error: Failed to fetch invites.
________________________________________
5. See All Invite Status (Admin)
GET /organizations/:orgId/invites
________________________________________
Description: Retrieves all invites for the specified organization.
URL Parameters:
•	orgId: The ID of the organization.
Response:
•	200 OK: Successfully retrieved invites.
json

{
  "invites": [
    {
      "organization": "orgId",
      "invitedBy": "userId",
      "invitee": "userId",
      "status": "pending"
    }
  ]
}
•	403 Forbidden: Unauthorized access.
•	500 Internal Server Error: Failed to fetch invites.
________________________________________
6. Accept or Decline Invite
POST /invites/:inviteId
________________________________________
Description: Updates the status of an invite.
URL Parameters:
•	inviteId: The ID of the invite.
Request Body:
json

{
  "status": "Accepted" // or "Declined"
}
Response:
•	200 OK: Invite status updated successfully.
json

{
  "message": "Invite status updated",
  "invite": {
    "organization": "orgId",
    "invitedBy": "userId",
    "invitee": "userId",
    "status": "Accepted"
  }
}
•	403 Forbidden: Unauthorized to update invite.
•	404 Not Found: Invite not found.
•	500 Internal Server Error: Failed to update invite status.
________________________________________
7. Leave Organization
POST /organizations/:orgId/leave
________________________________________
Description: Allows a user to leave an organization.
URL Parameters:
•	orgId: The ID of the organization.
Response:
•	200 OK: Successfully left the organization.
json

{
  "message": "Successfully left the organization"
}
•	404 Not Found: Organization not found.
•	500 Internal Server Error: Failed to leave organization.
________________________________________
8. Update Organization Details
PUT /organizations/:orgId
________________________________________
Description: Updates the details of an organization.
URL Parameters:
•	orgId: The ID of the organization.
Request Body:
json

{
  "name": "string",
  "description": "string"
}
Response:
•	200 OK: Organization updated successfully.
json

{
  "message": "Organization updated successfully",
  "organization": {
    "name": "string",
    "description": "string"
  }
}
•	403 Forbidden: Unauthorized to update organization.
•	404 Not Found: Organization not found.
•	500 Internal Server Error: Failed to update organization.
________________________________________
9. Get All Members of an Organization (Admin)
GET /organizations/:orgId/members
________________________________________
Description: Retrieves all members of the specified organization.
URL Parameters:
•	orgId: The ID of the organization.
Response:
•	200 OK: Successfully retrieved members.
json

{
  "message": "Members retrieved successfully",
  "members": ["userId1", "userId2"]
}
•	403 Forbidden: Unauthorized access.
•	404 Not Found: Organization not found.
•	500 Internal Server Error: Failed to fetch members.
________________________________________
10. Manage Members (Admin)
DELETE /organizations/:orgId/members/:userId
________________________________________
Description: Removes a member from the organization.
URL Parameters:
•	orgId: The ID of the organization.
•	userId: The ID of the user to remove.
Response:
•	200 OK: Member removed successfully.
json

{
  "message": "Member removed successfully",
  "organization": {
    "name": "string",
    "description": "string"
  }
}
•	403 Forbidden: Unauthorized to remove member.
•	404 Not Found: Organization not found.
•	500 Internal Server Error: Failed to remove member.
________________________________________
11. Delete Organization (Admin)
DELETE /organizations/:orgId
________________________________________
Description: Deletes the specified organization.
URL Parameters:
•	orgId: The ID of the organization.
Response:
•	200 OK: Organization deleted successfully.
json

{
  "message": "Organization deleted successfully..."
}
•	403 Forbidden: Unauthorized to delete organization.
•	404 Not Found: Organization not found.
•	500 Internal Server Error: Failed to delete organization.
________________________________________
12. Upload Image
POST /organizations/:orgId/upload-image
________________________________________
Description: Uploads an image to the organization.
URL Parameters:
•	orgId: The ID of the organization.
Request: Form-data with a file field named image.
Response:
•	200 OK: Image uploaded successfully.
json

{
  "message": "Image uploaded successfully",
  "mediaUrl": "url",
  "mediaId": "mediaId"
}
•	403 Forbidden: Unauthorized to upload image.
•	400 Bad Request: No file uploaded or invalid file format.
•	500 Internal Server Error: Failed to upload image.
________________________________________
13. Upload Video
POST /organizations/:orgId/upload-video
________________________________________
Description: Uploads a video to the organization.
URL Parameters:
•	orgId: The ID of the organization.
Request: Form-data with a file field named video.
Response:
•	200 OK: Video uploaded successfully.
json

{
  "message": "Video uploaded successfully",
  "mediaUrl": "url",
  "mediaId": "mediaId"
}
•	403 Forbidden: Unauthorized to upload video.
•	400 Bad Request: No file uploaded or invalid file format.
•	500 Internal Server Error: Failed to upload video.
________________________________________
14. Update Media
PUT /organizations/:orgId/update-media/:mediaId
________________________________________
Description: Updates an existing media file.
URL Parameters:
•	orgId: The ID of the organization.
•	mediaId: The ID of the media to update.
Request: Form-data with a file field named file.
Response:
•	200 OK: Media updated successfully.
json

{
  "message": "Media updated successfully",
  "url": "newUrl",
  "mediaId": "mediaId"
}
•	403 Forbidden: Unauthorized to update media.
•	404 Not Found: Media not found.
•	500 Internal Server Error: Failed to update media.
________________________________________
15. Delete Media
DELETE /organizations/:orgId/delete-media/:mediaId
________________________________________
Description: Deletes a media file from the organization.
URL Parameters:
•	orgId: The ID of the organization.
•	mediaId: The ID of the media to delete.
Response:
•	200 OK: Media deleted successfully.
json

{
  "message": "Media deleted successfully"
}
•	403 Forbidden: Unauthorized to delete media.
•	404 Not Found: Media not found.
•	500 Internal Server Error: Failed to delete media.
________________________________________

#boardRoutes.js
________________________________________
1. Create Board
•	Endpoint: POST /organizations/:orgId/boards
________________________________________
•	Description: Creates a new board in the specified organization.
•	Headers:
o	Authorization: Bearer <token>
•	Request Body:
json

{
    "title": "Board Title"
}
•	Responses:
o	201 Created
json

{
    "_id": "boardId",
    "title": "Board Title",
    "organizationId": "orgId",
    "cards": []
}
o	500 Internal Server Error
json

{
    "error": "Failed to create board"
}
________________________________________
2. Get All Boards
•	Endpoint: GET /organizations/:orgId/boards
________________________________________
•	Description: Retrieves all boards within the specified organization.
•	Headers:
o	Authorization: Bearer <token>
•	Responses:
o	200 OK
json

[
    {
        "_id": "boardId",
        "title": "Board Title",
        "organizationId": "orgId",
        "cards": []
    }
]
o	500 Internal Server Error
json

{
    "error": "Failed to fetch boards"
}
________________________________________
3. Delete Board
•	Endpoint: DELETE /organizations/:orgId/boards/:boardId
________________________________________
•	Description: Deletes a specific board from the organization.
•	Headers:
o	Authorization: Bearer <token>
•	Responses:
o	200 OK
json

{
    "message": "Board deleted successfully"
}
o	404 Not Found
json

{
    "error": "Organization not found"
}
o	403 Forbidden
json

{
    "error": "Only the admin can delete boards"
}
o	500 Internal Server Error
json

{
    "error": "Failed to delete board"
}
________________________________________
4. Create Card
•	Endpoint: POST /organizations/:orgId/boards/:boardId/cards
________________________________________
•	Description: Creates a new card in the specified board.
•	Headers:
o	Authorization: Bearer <token>
•	Request Body:
json

{
    "title": "Card Title",
    "position": 1
}
•	Responses:
o	201 Created
json

{
    "_id": "cardId",
    "title": "Card Title",
    "boardId": "boardId",
    "items": [],
    "position": 1
}
o	500 Internal Server Error
json

{
    "error": "Failed to create card"
}
________________________________________
5. Get All Cards in a Board
•	Endpoint: GET /organizations/:orgId/boards/:boardId/cards
________________________________________
•	Description: Retrieves all cards in a specified board.
•	Headers:
o	Authorization: Bearer <token>
•	Responses:
o	200 OK
json

[
    {
        "_id": "cardId",
        "title": "Card Title",
        "boardId": "boardId",
        "items": [],
        "position": 1
    }
]
o	500 Internal Server Error
json

{
    "error": "Failed to fetch cards"
}
________________________________________
6. Delete Card
•	Endpoint: DELETE /organizations/:orgId/boards/:boardId/cards/:cardId
________________________________________
•	Description: Deletes a specific card from the board.
•	Headers:
o	Authorization: Bearer <token>
•	Responses:
o	200 OK
json

{
    "message": "Card deleted successfully"
}
o	404 Not Found
json

{
    "error": "Board not found in this organization"
}
o	500 Internal Server Error
json

{
    "error": "Failed to delete card"
}
________________________________________
7. Create an Item in a Card
•	Endpoint: POST /organizations/:orgId/boards/:boardId/cards/:cardId/items
________________________________________
•	Description: Creates a new item in the specified card.
•	Headers:
o	Authorization: Bearer <token>
•	Request Body:
json

{
    "title": "Item Title",
    "assignedTo": "userId"
}
•	Responses:
o	201 Created
json

{
    "title": "Item Title",
    "assignedTo": "userId"
}
o	500 Internal Server Error
json

{
    "error": "Failed to create item"
}
________________________________________
8. Get Items in a Card
•	Endpoint: GET /organizations/:orgId/boards/:boardId/cards/:cardId/items
________________________________________
•	Description: Retrieves all items in the specified card.
•	Headers:
o	Authorization: Bearer <token>
•	Responses:
o	200 OK
json

[
    {
        "title": "Item Title",
        "assignedTo": "userId"
    }
]
o	500 Internal Server Error
json

{
    "error": "Failed to fetch items"
}
________________________________________
9. Update an Item in a Card
•	Endpoint: PUT /organizations/:orgId/boards/:boardId/cards/:cardId/items/:itemId
________________________________________
•	Description: Updates the specified item in the card.
•	Headers:
o	Authorization: Bearer <token>
•	Request Body:
json

{
    "title": "Updated Item Title",
    "assignedTo": "updatedUserId"
}
•	Responses:
o	200 OK
json

{
    "title": "Updated Item Title",
    "assignedTo": "updatedUserId"
}
o	500 Internal Server Error
json

{
    "error": "Failed to update item"
}
________________________________________
10. Delete an Item from a Card
•	Endpoint: DELETE /organizations/:orgId/boards/:boardId/cards/:cardId/items/:itemId
________________________________________
•	Description: Deletes a specific item from the card.
•	Headers:
o	Authorization: Bearer <token>
•	Responses:
o	200 OK
json

{
    "message": "Item deleted successfully"
}
o	500 Internal Server Error
json

{
    "error": "Failed to delete item"
}
________________________________________

#Conclusion: 
This documentation provides a comprehensive overview of the API endpoints available in this application. Each endpoint details the request method, expected request body, and potential responses for various scenarios. You can use tools like Postman to interact with these APIs for testing and development purposes.

