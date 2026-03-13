const functions = require('firebase-functions');
const admin = require('firebase-admin');
const fetch = require('node-fetch');
admin.initializeApp();

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';

exports.sendNoticeNotification = functions.firestore
  .document('notices/{noticeId}')
  .onWrite(async (change, context) => {
    const notice = change.after.exists ? change.after.data() : null;
    const prevNotice = change.before.exists ? change.before.data() : null;

    // 1. Faculty submits notice for approval → notify admin
    if (!prevNotice && notice && notice.status === 'pending') {
      const admins = await admin.firestore().collection('users').where('role', '==', 'admin').get();
      const tokens = admins.docs.map(doc => doc.data().expoPushToken).filter(Boolean);
      await sendExpoPush(tokens, {
        title: 'New Notice Pending Approval',
        body: `A new notice "${notice.title}" was submitted for approval.`,
        data: { type: 'new-notice', noticeId: context.params.noticeId }
      });
    }

    // 2. Admin approves/rejects → notify faculty
    if (prevNotice && notice && prevNotice.status === 'pending' && ['approved', 'rejected'].includes(notice.status)) {
      const faculty = await admin.firestore().collection('users').doc(notice.createdBy).get();
      const token = faculty.data().expoPushToken;
      if (token) {
        await sendExpoPush([token], {
          title: `Notice ${notice.status === 'approved' ? 'Approved' : 'Rejected'}`,
          body: `Your notice "${notice.title}" was ${notice.status}.`,
          data: { type: 'notice-status', noticeId: context.params.noticeId }
        });
      }
    }

    // 3. Notice approved → notify all students
    if (prevNotice && notice && prevNotice.status === 'pending' && notice.status === 'approved') {
      const students = await admin.firestore().collection('users').where('role', '==', 'student').get();
      const tokens = students.docs.map(doc => doc.data().expoPushToken).filter(Boolean);
      await sendExpoPush(tokens, {
        title: 'New Notice Posted',
        body: `A new notice "${notice.title}" is now available.`,
        data: { type: 'new-notice', noticeId: context.params.noticeId }
      });
    }
  });

async function sendExpoPush(tokens, message) {
  if (!tokens.length) return;
  const chunks = [];
  for (let i = 0; i < tokens.length; i += 100) {
    chunks.push(tokens.slice(i, i + 100));
  }
  for (const chunk of chunks) {
    await fetch(EXPO_PUSH_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(chunk.map(token => ({ to: token, ...message })))
    });
  }
}