const admin = require("firebase-admin");
const cron = require("node-cron");
const serviceAccount = require("./yangcheonlife-firebase-adminsdk-uu2g2-2c41d27ffc.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const baseUrl = "https://comsi.helgisnw.me";

// Fetch schedule dynamically
async function fetchSchedule(grade, classNumber) {
  const fetch = await import("node-fetch");
  const url = `${baseUrl}/${grade}/${classNumber}`;
  try {
    const response = await fetch.default(url);
    if (!response.ok) throw new Error("Failed to fetch");
    return await response.json();
  } catch (error) {
    console.error("Failed to fetch schedule:", error);
    return null;
  }
}

function formatClassInfo(classData) {
  if (!classData || !classData.subject) return null;
  return `${classData.classTime}교시 [${classData.subject}]입니다`;
}

async function sendNotificationForClass(grade, classNumber, classTime) {
  const schedule = await fetchSchedule(grade, classNumber);
  const today = new Date();
  const weekday = today.getDay() - 1; // JavaScript의 월요일은 0
  const currentClass = schedule[weekday]?.find((c) => c.classTime === classTime);

  if (currentClass) {
    const messageTitle = formatClassInfo(currentClass);
    if (messageTitle) {
      const messagePayload = {
        notification: {
          title: messageTitle,
        },
        topic: `${grade}-${classNumber}`,
      };

      admin
        .messaging()
        .send(messagePayload)
        .then((response) => {
          console.log(`Successfully sent message for grade ${grade} class ${classNumber}:`, response);
        })
        .catch((error) => {
          console.log("Error sending message:", error);
        });
    }
  }
}

// Schedule notifications for all classes and grades
const times = ["12 8", "12 9", "12 10", "12 11", "02 13", "02 14", "02 15"]; // 시간 설정
for (let grade = 1; grade <= 3; grade++) {
  for (let classNumber = 1; classNumber <= 11; classNumber++) {
    times.forEach((time, index) => {
      cron.schedule(`${time} * * 1-5`, () => sendNotificationForClass(grade, classNumber, index + 1));
      return new Promise((resolve) => setTimeout(resolve, 500));
    });
  }
}
