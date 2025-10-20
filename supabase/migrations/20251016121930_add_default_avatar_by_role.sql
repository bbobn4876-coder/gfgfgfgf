/*
  # Add default avatars based on user role

  1. Changes
    - Set default avatar URLs based on user role (admin, team-leader, team-member)
    - Update existing users without avatars to have role-appropriate default avatars
  
  2. Default Avatar URLs
    - Admin: https://cdn.discordapp.com/attachments/1424455923136467024/1425076074789867552/Group_549_1_1.png
    - Team Leader: https://cdn.discordapp.com/attachments/1424455923136467024/1425127993398788186/Group_622_2.png
    - Team Member: https://cdn.discordapp.com/attachments/1424455923136467024/1425150748655882250/Group_622_3.png
*/

-- Update admin users with default avatar
UPDATE users
SET avatar = 'https://cdn.discordapp.com/attachments/1424455923136467024/1425076074789867552/Group_549_1_1.png?ex=68f02844&is=68eed6c4&hm=d9224452b1537460f872dee35754fcdd2c363704cf27ee11436cd9d24e5a2b13&'
WHERE role = 'admin' AND (avatar IS NULL OR avatar = '');

-- Update team-leader users with default avatar
UPDATE users
SET avatar = 'https://cdn.discordapp.com/attachments/1424455923136467024/1425127993398788186/Group_622_2.png?ex=68f0589f&is=68ef071f&hm=2485eeb9d98af767bc463f924a069871aa3013bb1405b35abde34cb9bc3e76b3&'
WHERE role = 'team-leader' AND (avatar IS NULL OR avatar = '');

-- Update team-member users with default avatar
UPDATE users
SET avatar = 'https://cdn.discordapp.com/attachments/1424455923136467024/1425150748655882250/Group_622_3.png?ex=68f06dd0&is=68ef1c50&hm=f033c4f153045910e741d7471cbf6beeaaf7f5aedfe1b18af903d4ce4cca08c9&'
WHERE role = 'team-member' AND (avatar IS NULL OR avatar = '');