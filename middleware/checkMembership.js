const Organization = require('../models/organizationModel');

const checkMembership = async (req, res, next) => {
    const { orgId } = req.params;

    try {
        const organization = await Organization.findById(orgId);
        if (!organization) {
            return res.status(404).json({ error: 'Organization not found' });
        }

        // Check if the user is a member of the organization
        if (!organization.members.includes(req.user.userId)) {
            return res.status(403).json({ error: 'You are not a member of this organization' });
        }

        // User is a member, proceed to the next middleware
        next();
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to check organization membership' });
    }
};

module.exports = checkMembership;