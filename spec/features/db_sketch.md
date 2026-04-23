Course Hub

Users

- Admin
- User

User

- Id
- Name
- Email
- Username
- Bio
- ProfileUrl
- CreatedCourse []
- EnrolledCourse []
- Role

Course

- Id
- Name
- Description
- Media []
- Lesson []
- Topic[]
- Status: // Draft, Published, Unpublished, Deleted (soft delete)
- Creator
- Student []
  // Will be different for every user, and probably will be stored as a separate table in the database to track user progress
- Current Topic

Topic

- Id
- Name
- Description
- Media []
- Lesson[]
  // Will be different for every user, and probably will be stored as a separate table in the database to track user progress
- Current Lesson
  - Id
  - Time

Lesson

- Id
- Name
- Description
- Media []

Media

- Id
- Name
- Type: // video, image, pdf
- Url
