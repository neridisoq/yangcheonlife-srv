const express = require("express");
const Timetable = require("./util");

const app = express();
const timetable = new Timetable();

// Initialize the timetable module
async function initTimetable() {
  try {
    await timetable.init();
    console.log("Timetable module initialized.");
  } catch (error) {
    console.error("Error initializing timetable:", error.message);
  }
}

// Search for the school and set it
async function setSchool(req, res, next) {
  try {
    const schoolList = await timetable.search("양천고등학교");
    const targetSchool = schoolList.find((school) => {
      return school.region === "서울" && school.name === "양천고등학교";
    });
    if (targetSchool) {
      await timetable.setSchool(targetSchool.code);
      console.log("School set to 양천고등학교.");
      next();
    } else {
      throw new Error("양천고등학교 not found.");
    }
  } catch (error) {
    console.error("Error setting school:", error.message);
    res.status(500).send("Internal Server Error");
  }
}

// 시간표 수정 로직을 추가하는 함수
// 시간표 수정 로직을 추가하는 함수
// 시간표 수정 로직을 추가하는 함수
function modifyClassTimetable(timetable, grade, classNumber) {
  if (grade === 2 && classNumber >= 1 && classNumber <= 11) {
    timetable.forEach((day) => {
      day.forEach((lesson) => {
        if (lesson.weekdayString === "월") {
          if (lesson.classTime === 3) {
            lesson.subject = "탐구B";
            lesson.teacher = ""; // 선생님 이름 비우기
          }
          if (lesson.classTime === 4) {
            lesson.subject = "탐구C";
            lesson.teacher = ""; // 선생님 이름 비우기
          }
        } else if (lesson.weekdayString === "화") {
          if (lesson.classTime === 1) {
            lesson.subject = "탐구D";
            lesson.teacher = ""; // 선생님 이름 비우기
          }
          if (lesson.classTime === 2) {
            lesson.subject = "탐구B";
            lesson.teacher = ""; // 선생님 이름 비우기
          }
        } else if (lesson.weekdayString === "목") {

        /* else if (lesson.weekdayString === "화") {
          if (lesson.classTime === 1) {
            lesson.subject = "탐구D";
            lesson.teacher = ""; // 선생님 이름 비우기
          }
          if (lesson.classTime === 2) {
            lesson.subject = "탐구B";
            lesson.teacher = ""; // 선생님 이름 비우기
          }
        } */
          if (lesson.classTime === 3) {
            lesson.subject = "탐구C";
            lesson.teacher = ""; // 선생님 이름 비우기
          }
          if (lesson.classTime === 4) {
            lesson.subject = "탐구D";
            lesson.teacher = ""; // 선생님 이름 비우기
          }
        }
        if (lesson.teacher && lesson.teacher.trim().length > 0) {
          lesson.teacher = lesson.teacher + '*T';
        }
      });
    });
  }
  return timetable;
}

// Middleware to retrieve and modify timetable data
async function getTimetableData(req, res) {
  try {
    const grade = parseInt(req.params.grade);
    const classNumber = parseInt(req.params.classNumber);
    const timetableData = await timetable.getTimetable();

    if (timetableData[grade] && timetableData[grade][classNumber]) {
      let classTimetable = timetableData[grade][classNumber];

      // 시간표 수정 로직 적용
      classTimetable = modifyClassTimetable(classTimetable, grade, classNumber);

      // 변경된 데이터를 JSON 형식으로 클라이언트에 응답
      res.send(JSON.stringify(classTimetable));
    } else {
      throw new Error(`Timetable not found for grade ${grade}, class ${classNumber}.`);
    }
  } catch (error) {
    console.error("Error getting timetable data:", error.message);
    res.status(404).send("Timetable not found.");
  }
}

// Middleware to handle root endpoint
app.get("/:grade/:classNumber", setSchool, getTimetableData);

// Start the server
const PORT = process.env.PORT || 3000;
initTimetable().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});
