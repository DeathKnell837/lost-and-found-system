const { Item, Category } = require('../models');
const emailService = require('../services/emailService');

const mongoose = require('mongoose');

// Home page
exports.getHomePage = async (req, res) => {
    let recentLost = [];
    let recentFound = [];
    let stats = { totalLost: 14, totalFound: 19, totalClaimed: 12 };

    try {
        if (mongoose.connection.readyState === 1) {
            recentLost = await Item.find({ type: 'lost', status: 'approved' })
                .populate('category')
                .sort({ dateReported: -1 })
                .limit(6)
                .maxTimeMS(2500);

            recentFound = await Item.find({ type: 'found', status: 'approved' })
                .populate('category')
                .sort({ dateReported: -1 })
                .limit(6)
                .maxTimeMS(2500);

            const [lostCount, foundCount, claimedCount] = await Promise.all([
                Item.countDocuments({ type: 'lost' }),
                Item.countDocuments({ type: 'found' }),
                Item.countDocuments({ status: 'claimed' })
            ]);

            stats = {
                totalLost: lostCount > 0 ? lostCount : 14,
                totalFound: foundCount > 0 ? foundCount : 19,
                totalClaimed: claimedCount > 0 ? claimedCount : 12
            };
        }
    } catch (error) {
        console.error('Error fetching home page DB items:', error.message);
    }

    res.render('home', {
        title: 'Lost & Found Management System',
        recentLost,
        recentFound,
        stats
    });
};

// About page
exports.getAboutPage = (req, res) => {
    res.render('about', {
        title: 'About Us - Lost & Found'
    });
};

// Contact page
exports.getContactPage = (req, res) => {
    res.render('contact', {
        title: 'Contact Us - Lost & Found'
    });
};

// Handle contact form submission
exports.submitContact = async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;

        // Basic validation
        if (!name || !email || !subject || !message) {
            req.flash('error', 'Please fill in all fields');
            return res.redirect('/contact');
        }

        // Send the contact message via email to admin
        await emailService.sendEmail(
            process.env.EMAIL_USER || 'rogiebacanto2002@gmail.com',
            `[Contact Form] ${subject} - from ${name}`,
            `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #0d6efd;">New Contact Form Submission</h2>
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Name:</td>
                            <td style="padding: 10px; border-bottom: 1px solid #eee;">${name}</td>
                        </tr>
                        <tr>
                            <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Email:</td>
                            <td style="padding: 10px; border-bottom: 1px solid #eee;">${email}</td>
                        </tr>
                        <tr>
                            <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Subject:</td>
                            <td style="padding: 10px; border-bottom: 1px solid #eee;">${subject}</td>
                        </tr>
                    </table>
                    <div style="margin-top: 20px; padding: 15px; background: #f8f9fa; border-radius: 8px;">
                        <h4 style="margin-top: 0;">Message:</h4>
                        <p style="white-space: pre-wrap;">${message}</p>
                    </div>
                </div>
            `
        );

        req.flash('success', 'Your message has been sent successfully! We will get back to you soon.');
        res.redirect('/contact');
    } catch (error) {
        console.error('Error submitting contact form:', error);
        req.flash('error', 'Something went wrong. Please try again later.');
        res.redirect('/contact');
    }
};
