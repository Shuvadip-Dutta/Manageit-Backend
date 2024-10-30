const express = require('express');
const router = express.Router();
const multer = require('multer');
const bucket = require('../firebaseConfig');
const Organization = require('../models/organizationModel');
const Invite = require('../models/inviteModel');
const User = require('../models/userModel');
const Media = require('../models/mediaModel');
const { authenticateToken, tokenBlacklist } = require('../middleware/authenticateToken');

//Config Multer
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 20 * 1024 * 1024 }, //10MB
    fileFilter: (req, file, cb) => {
        const imageTypes = [
            'image/jpeg',  // .jpg, .jpeg
            'image/png',   // .png
            'image/gif',   // .gif
            'image/bmp',   // .bmp
            'image/webp'   // .webp
        ];

        const videoTypes = [
            'video/mp4',   // .mp4
            'video/mpeg',  // .mpeg
            'video/ogg',   // .ogv
            'video/webm',  // .webm
            'video/quicktime'  // .mov
        ];

        if (imageTypes.includes(file.mimetype) || videoTypes.includes(file.mimetype)) {
            cb(null, true)
        }
        else {
            cb(new Error('Only images and videos in allowed formats are permitted'), false);
        }
    }
});

//Check user is in a organization
async function isUserInOrganization(userId, orgId) {
    const organization = await Organization.findById(orgId);
    return organization && organization.members.includes(userId);
}


//Create Organization
router.post('/organizations', authenticateToken, async (req, res) => {
    try {
        const { name, description } = req.body;

        const organization = new Organization({ name, description, admin: req.user.userId, members: [req.user.userId] });
        await organization.save();
        res.status(201).json(organization);
    } catch (error) {
        console.error('Error creating organization:', error);
        res.status(500).json({ error: 'Failed to create organization. Please try again.' });
    }
});

//Get all organizations
router.get('/organizations', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;

        const organizations = await Organization.find({ members: userId });
        if (organizations.length === 0) {
            return res.status(404).json({ message: " No organization found" });
        }

        res.status(200).json({ organizations });
    } catch (error) {
        console.error('Error fetching organizations:', error);
        res.status(500).json({ error: 'Failed to fetch organizations. Please try again.' });
    }
});

//Invite user
router.post('/organizations/:orgId/invite', authenticateToken, async (req, res) => {
    try {
        const { orgId } = req.params;
        const { userId } = req.body;

        const organization = await Organization.findById(orgId);
        if (!organization || organization.admin.toString() !== req.user.userId) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        const isMember = organization.members.includes(userId);
        const existingInvite = await Invite.findOne({ organizationId: orgId, invitedBy: req.user.userId, status: 'pending' });

        if (isMember) return res.status(400).json({ error: 'User is already a member' });
        if (existingInvite) return res.status(400).json({ error: 'User already has a pending invite' });

        const invite = new Invite({ organization: orgId, invitedBy: req.user.userId, invitee: userId });
        await invite.save();
        res.status(201).json({ message: 'User invited successfully...', invite });
    } catch (error) {
        console.error('Error inviting user:', error);
        res.status(500).json({ error: 'Failed to invite user. Please try again.' });
    }
});

//See all the invites(User)
router.get('/invites', authenticateToken, async (req, res) => {
    try {
        const invites = await Invite.find({ invitee: req.user.userId });

        if ((invites.length) === 0) {
            return res.status(404).json({ message: "No invites found" });
        }

        res.status(200).json({ invites });
    } catch (error) {
        console.error('Error fetching invites:', error);
        res.status(500).json({ error: 'Failed to fetch invites. Please try again.' });
    }
});

// See al the invite status(Admin)
router.get('/organizations/:orgId/invites', authenticateToken, async (req, res) => {
    try {
        const { orgId } = req.params;

        const organization = await Organization.findById(orgId);
        if (!organization || organization.admin.toString() !== req.user.userId) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        const invites = await Invite.find({ organization: orgId });

        res.status(200).json({ invites });
    } catch (error) {
        console.error('Error fetching invites for organization:', error);
        res.status(500).json({ error: 'Failed to fetch invites. Please try again.' });
    }
})

//Accept or Decline invite
router.post('/invites/:inviteId', authenticateToken, async (req, res) => {
    try {
        const { inviteId } = req.params;
        const { status } = req.body;

        const invite = await Invite.findById(inviteId);
        if (!invite || invite.invitee.toString() !== req.user.userId) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        invite.status = status;
        await invite.save();

        if (status === 'Accepted') {
            const organization = await Organization.findById(invite.organization);
            if (!organization.members.includes(req.user.userId)) {
                organization.members.push(req.user.userId);
                await organization.save();
            }
        }
        res.status(200).json({ message: 'Invite status updated', invite });
    } catch (error) {
        console.error('Error updating invite status:', error);
        res.status(500).json({ error: 'Failed to update invite status. Please try again.' });
    }
});

//Leave Organization
router.post('/organizations/:orgId/leave', authenticateToken, async (req, res) => {
    try {
        const { orgId } = req.params;

        const organization = await Organization.findById(orgId);
        if (!organization) return res.status(404).json({ error: 'Organization not found' });

        organization.members = organization.members.filter(memberId => memberId.toString() !== req.user.userId);
        await organization.save();

        await Invite.deleteMany({ organization: orgId, invitee: req.user.userId, status: 'pending' });

        res.json({ message: 'Successfully left the organization' });
    } catch (error) {
        console.error('Error leaving organization:', error);
        res.status(500).json({ error: 'Failed to leave organization. Please try again.' });
    }
});

//Update organization details
router.put('/organizations/:orgId', authenticateToken, async (req, res) => {
    try {
        const { orgId } = req.params
        const { name, description } = req.body;

        const organization = await Organization.findById(orgId);
        if (!organization || organization.admin.toString() !== req.user.userId) {
            return res.status(403).json({ error: 'Unauthorized' });
        };

        organization.name = name;
        organization.description = description;
        await organization.save();

        res.json({ message: 'Organization updated successfully', organization });
    } catch (error) {
        console.error('Error updating organization:', error);
        res.status(500).json({ error: 'Failed to update organization. Please try again.' });
    }
});

// Get all members of an organization(Admin)
router.get('/organizations/:orgId/members', authenticateToken, async (req, res) => {
    try {
        const { orgId } = req.params;

        const organization = await Organization.findById(orgId);
        if (!organization) {
            return res.status(404).json({ error: 'Organization not found' });
        }

        if (organization.admin.toString() !== req.user.userId) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        const members = organization.members;

        res.json({ message: 'Members retrieved successfully', members });
    } catch (error) {
        console.error('Error fetching organization members:', error);
        res.status(500).json({ error: 'Failed to fetch members. Please try again.' });
    }
});

//Manage members(Admin)
router.delete('/organizations/:orgId/members/:userId', authenticateToken, async (req, res) => {
    try {
        const { orgId } = req.params;
        const { userId } = req.body;

        const organization = await Organization.findById(orgId);
        if (!organization || organization.admin.toString() !== req.user.userId) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        organization.members = organization.members.filter(memberId => memberId.toString() !== req.user.userId);
        await organization.save();

      
        await Invite.deleteMany({ organization: orgId, invitee: userId, status: 'Accepted' });

        res.json({ message: 'Member removed successfully', organization });
    } catch (error) {
        console.error('Error removing member:', error);
        res.status(500).json({ error: 'Failed to remove member. Please try again.' });
    }
});

// Delete Organization(Admin)
router.delete('/organizations/:orgId', authenticateToken, async (req, res) => {
    try {
        const { orgId } = req.params;

        const organization = await Organization.findById(orgId);
        if (!organization || organization.admin.toString() !== req.user.userId) {
            return res.status(403).json({ error: ' Unauthorized' });
        };

        await organization.deleteOne();
        await Invite.deleteMany({ organization: orgId });
        res.json({ message: 'Organization deleted successfully...' });
    } catch (error) {
        console.error('Error removing member:', error);
        res.status(500).json({ error: 'Failed to delete organization. Please try again.' });
    }
});


//Upload image
router.post('/organizations/:orgId/upload-image', authenticateToken, upload.single('image'), async (req, res) => {
    try {
        const file = req.file;
        const userId = req.user.userId;
        const { orgId } = req.params;

        if (!file) {
            return res.status(400).json({ error: 'No file uploaded or invalid file format. Only images are allowed.' });
        }

        if (!await isUserInOrganization(userId, orgId)) {
            return res.status(403).json({ error: 'Unauthorized' });
        };

        const firebaseFileName = `images/${orgId}_${userId}_${Date.now()}_${file.originalname}`;

        const fileupload = bucket.file(firebaseFileName);
        await fileupload.save(file.buffer);

        const [url] = await fileupload.getSignedUrl({
            action: 'read',
            expires: '03-09-2491'
        });

        if (!url) {
            return res.status(500).json({ error: 'Failed to retrieve media URL.' });
        }

        const media = new Media({
            orgId,
            userId,
            url,
            mediaType: 'image'
        });
        await media.save();

        res.json({ message: 'Image uploaded successfully', mediaUrl: url, mediaId: media._id });
    } catch (error) {
        console.error('Error in image upload route:', error);
        res.status(500).json({ error: 'Failed to upload image. Please try again.' });
    }
});

//Upload Video
router.post('/organizations/:orgId/upload-video', authenticateToken, upload.single('video'), async (req, res) => {
    try {
        const file = req.file;
        const userId = req.user.userId;
        const { orgId } = req.params;

        if (!await isUserInOrganization(userId, orgId)) {
            return res.status(403).json({ error: 'Unauthorized' });
        };

        if (!file) {
            return res.status(400).json({ error: 'No file uploaded or invalid file format. Only videos are allowed.' });
        }

        const firebaseFileName = `videos/${orgId}_${userId}_${Date.now()}_${file.originalname}`;

        const fileupload = bucket.file(firebaseFileName);
        await fileupload.save(file.buffer);

        const [url] = await fileupload.getSignedUrl({
            action: 'read',
            expires: '03-09-2491'
        });

        if (!url) {
            return res.status(500).json({ error: 'Failed to retrieve media URL.' });
        }

        // await Organization.findByIdAndUpdate(orgId, { $push: { media: { url, uploadedBy: userId}}});

        const media = new Media({
            orgId,
            userId,
            url,
            mediaType: 'video'
        });
        await media.save();

        res.json({ message: 'video uploaded successfully', mediaUrl: url, mediaId: media._id });
    } catch (error) {
        console.error('Error in video upload route:', error);
        res.status(500).json({ error: 'Failed to upload video. Please try again.' });
    }
});


//Update Media
router.put('/organizations/:orgId/update-media/:mediaId', authenticateToken, upload.single('file'), async (req, res) => {
    try {
        const { orgId, mediaId } = req.params;
        const file = req.file;
        const userId = req.user.userId;

        if (!await isUserInOrganization(userId, orgId)) {
            return res.status(403).json({ error: 'Unauthorized' });
        };

        const media = await Media.findOne({ _id: mediaId, orgId, userId });
        if (!media) {
            return res.status(404).json({ error: 'Media not found' });
        };

        // Determine the folder based on media type
        const mediaFolder = media.mediaType === 'image' ? 'images' : 'videos';

        const existingFileName = decodeURIComponent(media.url.split('/').pop().split('?')[0]); 
        const existingFile = bucket.file(`${mediaFolder}/${existingFileName}`);

        try {
            await existingFile.delete();
        } catch (error) {
            console.error('Error deleting existing file:', error);
            return res.status(500).json({ error: 'Failed to delete existing file from storage' });
        }


        const firebaseFileName = `${media.mediaType}s/${orgId}_${userId}_${Date.now()}_${file.originalname}`;
        const newFileUpload = bucket.file(firebaseFileName);

        await newFileUpload.save(file.buffer);

        const [newurl] = await newFileUpload.getSignedUrl({
            action: 'read',
            expires: '03-09-2491'
        });

        //Update mongo
        media.url = newurl;
        await media.save();

        res.json({ message: 'Media updated successfully', url: newurl, mediaId: media._id });
    } catch (error) {
        console.error('Error in file upload route:', error);
        res.status(500).json({ error: 'Failed to upload file. Please try again.' });
    }
});

//Delete Media
router.delete('/organizations/:orgId/delete-media/:mediaId', authenticateToken, async (req, res) => {
    try {
        const { orgId, mediaId } = req.params;
        const userId = req.user.userId;

        if (!await isUserInOrganization(userId, orgId)) {
            return res.status(403).json({ error: 'Unauthorized' });
        };

        const media = await Media.findOne({ _id: mediaId, orgId, userId });
        if (!media) {
            return res.status(404).json({ error: 'Media not found' });
        };

  
        const mediaFolder = media.mediaType === 'image' ? 'images' : 'videos';

        const fileToDeleteName = decodeURIComponent(media.url.split('/').pop().split('?')[0]); 

        const fileToDelete = bucket.file(`${mediaFolder}/${fileToDeleteName}`);

        try {
            await fileToDelete.delete();
        } catch (error) {
            return res.status(500).json({ error: 'Failed to delete file from storage' });
        }

        await Media.findByIdAndDelete(mediaId);

        res.json({ message: 'Media deleted successfully' });
    } catch (error) {
        console.error('Error in delete route:', error);
        res.status(500).json({ error: 'Failed to delete file. Please try again.' });
    }
});


//Delete media Admin
router.delete('/organizations/:orgId/media/:mediaId', authenticateToken, async (req, res) => {
    try {
        const { orgId, mediaId } = req.params;
        const userId = req.user.userId;

        const organization = await Organization.findById(orgId);
        const media = await Media.findById(mediaId);
        if (!organization || !media || (media.userId.toString() !== userId && organization.admin.toString() !== userId)) {
            return res.status(404).json({ error: 'Unauthorized or media not found' });
        };

      
        const mediaFolder = media.mediaType === 'image' ? 'images' : 'videos';

        const fileToDeleteName = decodeURIComponent(media.url.split('/').pop().split('?')[0]); 
        console.log('Attempting to delete file:', fileToDeleteName);

        const fileToDelete = bucket.file(`${mediaFolder}/${fileToDeleteName}`);

        try {
            await fileToDelete.delete();
            console.log(`Successfully deleted file: ${fileToDeleteName}`);
        } catch (error) {
            console.error('Error deleting file:', error);
            return res.status(500).json({ error: 'Failed to delete file from storage' });
        }


        await Media.findByIdAndDelete(mediaId);

        res.json({ message: 'Media deleted successfully' });
    } catch (error) {
        console.error('Error in delete route:', error);
        res.status(500).json({ error: 'Failed to delete file. Please try again.' });
    }
})



module.exports = router;

