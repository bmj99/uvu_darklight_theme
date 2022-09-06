let statusCode = 0;

// NOTE: As per Wagstaff's in-class instructions, copied this function from this website: https://www.tutorialspoint.com/how-to-create-guid-uuid-in-javascript
function createUUID() {
  return 'xxxxxxx'.replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0,
      v = c == 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function getLogDate() {
  const date = new Date();
  let logDate = date.toLocaleString('en-US');
  let formattedLogDate = logDate.replace(',', '');
  return formattedLogDate;
}

// Hide the UVU ID field until the user selects a course from the dropdown list
document.getElementById('course').addEventListener('change', function () {
  this.value != ''
    ? (document.getElementById('uvuId').style.display = 'block')
    : (document.getElementById('uvuId').style.display = 'none');
  console.debug('Selected course value: ' + this.value);
});

// Restrict user input of the UVU ID to numbers only with a max of 8
document.getElementById('uvuId').addEventListener('keydown', function (event) {
  console.debug(
    `Pressed key: ${event.key}\nUVU ID Length: ${this.value.length}`
  );

  // Only allow numbers
  if (isNaN(event.key)) {
    console.debug('Ignoring non-number pressed key: ' + event.key);
    event.preventDefault();
  }

  if (this.value.length > 7) {
    console.debug(
      `Exceeded limit, current length: ${this.value.length}, ignoring pressed key: ${event.key}`
    );
    event.preventDefault();
  }
});

// Once 8 numbers are reached, get and display the logs for that course and UVU ID
document.getElementById('uvuId').addEventListener('keyup', function () {
  if (this.value.length == 8) {
    let course = document.getElementById('course').value;
    let uvuId = document.getElementById('uvuId').value;
    console.debug(`UVU ID: ${uvuId}`);
    document.getElementById('uvuIdDisplay').style.display = 'block';
    document.getElementById(
      'uvuIdDisplay'
    ).innerText = `Student Logs for ${uvuId}`;
    displayLogs(course, uvuId);
    document.getElementById('addLogBtn').disabled = false;
  }
});

// When the Add Log button is clicked, use fetch to POST new log to DB and add to displayed list
document.getElementById('addLogBtn').addEventListener('click', function () {
  console.debug('Add Log button was clicked');
  let logText = document.getElementById('newLogText').value;
  if (logText.length > 0) {
    let uuid = createUUID();
    let course = document.getElementById('course').value;
    let uvu = document.getElementById('uvuId').value;
    let logDate = getLogDate();

    console.log(`New Log
    UUID: ${uuid}\n
    Course: ${course}\n
    UVUID: ${uvu}\n
    Date: ${logDate}\n
    Text: ${logText}`);

    postLog(
      'https://json-server-ehtjza--3000.local.webcontainer.io/api/v1/logs/',
      { courseId: course, uvuId: uvu, date: logDate, text: logText, id: uuid }
    ).then((data) => {
      console.debug(data);
      displayLogs(course, uvu);
    });

    document.getElementById('newLogText').value = '';
  } else {
    console.log('Log text is empty, submission was unsuccessful.');
  }
});

async function postLog(url = '', data = {}) {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return await response.json();
}

// Uses fetch to retrieve the logs
async function getLogs(course, uvuId) {
  try {
    let url =
      'https://json-server-ehtjza--3000.local.webcontainer.io/api/v1/logs?courseId=' +
      course +
      '&uvuId=' +
      uvuId;
    let res = await fetch(url);
    statusCode = res.status;
    return await res.json();
  } catch (error) {
    console.error(error);
  }
}

// Waits for fetch to complete, then displays the logs
async function displayLogs(course, uvuId) {
  let logs = await getLogs(course, uvuId);

  if (statusCode == 200 || statusCode == 304) {
    // Reset innerHTML
    console.log('Retrieved Logs');
    document.getElementById('logsDisplay').innerHTML = '';

    // For each log received from getLogs(), add to the innerHTML of the ul
    for (let log in logs) {
      console.debug(`\nLog Number: ${log}\n
      Log Date: ${logs[log].date}\n
      Log Text: ${logs[log].text}\n`);

      let newLogHtml = `<li id="logId${log}" class="logEntry bg-yellow-100">
        <div><small>${logs[log].date}</small></div>
        <pre><p>${logs[log].text}</p></pre>
        </li>`;

      document.getElementById('logsDisplay').innerHTML += newLogHtml;
    }

    // Add event listener for each log
    for (let log in logs) {
      document
        .getElementById(`logId${log}`)
        .addEventListener('click', function () {
          toggleLogVisibility(`logId${log}`);
        });
    }
  } else {
    console.error('Expected 200 or 304 status code, received: ' + statusCode);
    document.getElementById(
      'logsDisplay'
    ).innerHTML = `<li id="logsError">ERROR: There was an error retreiving the desired logs.</li>`;
  }
}

// Hide/Show the text of a lock when clicked
function toggleLogVisibility(logId) {
  el = document.querySelector(`#${logId} > pre`);
  if (el.style.display == 'none') {
    el.style.display = 'block';
    console.debug(`Log ${logId} was hidden, now is displayed`);
  } else {
    el.style.display = 'none';
    console.debug(`Log ${logId} was displayed, now is hidden`);
  }
}

// Fetch the list of courses from the database and add to the dropdown
function initializeCoursesDropDown() {
  var select = document.getElementById('course');
  fetch('https://json-server-ehtjza--3000.local.webcontainer.io/api/v1/courses')
    .then((response) => response.json())
    .then((courses) => {
      for (let course in courses) {
        var newCourse = new Option(courses[course].display, courses[course].id);
        select.options[select.options.length] = newCourse;
        console.debug('Added new course to dropdown: ', newCourse);
      }
    });
}

function testMe() {
  console.log('Test Mode!');
  initializeCoursesDropDown();
  displayLogs('cs4660', '10111111');
  document.getElementById('uvuId').style.display = 'block';
  document.getElementById('addLogBtn').disabled = false;
}
