const { Item, Category } = require('../models');
const emailService = require('../services/emailService');

// Home page
exports.getHomePage = async (req, res) => {
    try {
        // Get recent approved items
        const recentLost = await Item.find({ type: 'lost', status: 'approved' })
            .populate('category')
            .sort({ dateReported: -1 })
            .limit(6);

        const recentFound = await Item.find({ type: 'found', status: 'approved' })
            .populate('category')
            .sort({ dateReported: -1 })
            .limit(6);

        // Get statistics
        const stats = {
            totalLost: await Item.countDocuments({ type: 'lost', status: 'approved' }),
            totalFound: await Item.countDocuments({ type: 'found', status: 'approved' }),
            totalClaimed: await Item.countDocuments({ status: 'claimed' })
        };

        res.render('home', {
            title: 'Lost & Found Management System',
            recentLost,
            recentFound,
            stats
        });
    } catch (error) {
        console.error('Error loading home page:', error);
        req.flash('error', 'Error loading page');
        res.render('home', {
            title: 'Lost & Found Management System',
            recentLost: [],
            recentFound: [],
            stats: { totalLost: 0, totalFound: 0, totalClaimed: 0 }
        });
    }
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
        await emailService.sendEmail({
            to: process.env.EMAIL_USER || 'rogiebacanto2002@gmail.com',
            subject: `[Contact Form] ${subject} - from ${name}`,
            html: `
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
        });

        req.flash('success', 'Your message has been sent successfully! We will get back to you soon.');
        res.redirect('/contact');
    } catch (error) {
        console.error('Error submitting contact form:', error);
        req.flash('success', 'Your message has been received! We will get back to you soon.');
        res.redirect('/contact');
    }
};
