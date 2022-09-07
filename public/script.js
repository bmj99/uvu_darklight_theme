let statusCode = 0;

// Toggle the theme colors
$('#theme-toggle').on('change', function () {
  // console.log(`Theme toggle value: ${this.checked}`);
  if (this.checked) {
    // localStorage.getItem('color-theme') === 'dark' || (!('color-theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)
    console.log(`Theme changed to Dark Mode!`);
    $('html').addClass('dark');
  } else {
    console.log(`Theme changed to Light Mode!`);
    $('html').removeClass('dark');
  }
});

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
$('#course').on('change', function () {
  if (this.value != '') {
    $('#uvuId').removeClass('hidden');
    console.debug(`Course ${this.value} selected, displaying UVU ID`);
  } else {
    $('#uvuId').addClass('hidden');
    console.debug('No course selected, hiding UVU ID');
  }
});

// Restrict user input of the UVU ID to numbers only with a max of 8
$('#uvuId').on('keydown', function (event) {
  // Only allow numbers
  if (isNaN(event.key)) {
    console.debug(`Ignoring non-number pressed key: ${event.key}`);
    event.preventDefault();
  }

  // Only allow up to 8 numbers
  if (this.value.length > 7) {
    console.debug(
      `Exceeded limit, current length: ${this.value.length}, ignoring pressed key: ${event.key}`
    );
    event.preventDefault();
  }
});

// Once 8 numbers are reached, get and display the logs for that course and UVU ID
$('#uvuId').on('keyup', function () {
  var uvuId = $('#uvuId')[0].value;
  var course = $('#course')[0].value;

  if (uvuId.length === 8) {
    var uvuIdDisplay = $('#uvuIdDisplay');
    $('#addLogBtn').removeAttr('disabled');

    console.debug(`Course: ${course}\nUVU ID: ${uvuId}`);
    $('#uvuIdDisplay').removeClass('hidden');
    uvuIdDisplay.innerTxt(`Student Logs for ${uvuId}`);
    displayLogs(course, uvuId);
  }
});

// When the Add Log button is clicked, use axios to POST new log to DB and add to displayed list
$('#addLogBtn').on('click', function () {
  console.debug('Add Log button was clicked');
  let logText = $('#newLogText').val();
  if (logText.length > 0) {
    let uuid = createUUID();
    let course = $('#course').val();
    let uvu = $('#uvuId').val();
    let logDate = getLogDate();

    console.log(`New Log\n
    UUID: ${uuid}\n
    Course: ${course}\n
    UVUID: ${uvu}\n
    Date: ${logDate}\n
    Text: ${logText}`);

    postLog(
      'https://json-server-ehtjza--3000.local.webcontainer.io/api/v1/logs/',
      { courseId: course, uvuId: uvu, date: logDate, text: logText, id: uuid }
    );

    displayLogs(course, uvu);

    // Set the New Log textbox to empty
    $('#newLogText').val('');
  } else {
    console.log('Log text is empty, submission was unsuccessful.');
  }
});

async function postLog(url = '', logInfo = {}) {
  const response = await axios({
    method: 'post',
    url: url,
    headers: { 'Content-Type': 'application/json' },
    data: logInfo,
  })
    .then((res) => {
      console.debug(res);
    })
    .catch(function (error) {
      console.error(error);
    });
  return await response;
}

// Uses axios to retrieve the logs
async function getLogs(course, uvuId) {
  try {
    let url =
      'https://json-server-ehtjza--3000.local.webcontainer.io/api/v1/logs?courseId=' +
      course +
      '&uvuId=' +
      uvuId;
    let res = await axios.get(url);
    statusCode = res.status;
    return await res.data;
  } catch (error) {
    console.error(error);
  }
}

// Waits for axios to complete, then displays the logs
async function displayLogs(course, uvuId) {
  let logs = await getLogs(course, uvuId);

  if (statusCode == 200 || statusCode == 304) {
    // Reset innerHTML
    $('#logsDisplay').inHtml('');

    // For each log received from getLogs(), add to the innerHTML of the ul
    for (let log in logs) {
      console.debug(
        `Retrieved Logs\nLog Number: ${log}\nLog Date: ${logs[log].date}\nLog Text: ${logs[log].text}\n`
      );

      let newLogHtml = `<li id="logId${log}" class="logEntry cursor-pointer border-l-4 border-purple-500 pl-2 pb-2 m-1 bg-purple-300 hover:bg-purple-500 hover:border-purple-600 rounded">
      <div><small>${logs[log].date}</small></div>
      <pre class="whitespace-pre-wrap"><p>${logs[log].text}</p></pre>
      </li>`;

      let text = $('#logsDisplay').inHtml();
      text += newLogHtml;
      $('#logsDisplay').inHtml(text);
    }

    // Add event listener for each log
    for (let log in logs) {
      $(`#logId${log}`).on('click', function () {
        if ($(`#logId${log} > pre`).hasClass('hidden')) {
          console.debug(`Log ${log} was hidden, now is displayed`);
          $(`#logId${log} > pre`).removeClass('hidden');
        } else {
          console.debug(`Log ${log} was displayed, now is hidden`);
          $(`#logId${log} > pre`).addClass('hidden');
        }
      });
    }
  } else {
    console.error('Expected 200 or 304 status code, received: ' + statusCode);
    $('#logsDisplay').inHtml(
      `<li id="logsError">ERROR: There was an error retreiving the desired logs.</li>`
    );
  }
}

// Use axios to get the list of courses from the database and add to the dropdown
async function initializeCoursesDropDown() {
  var select = document.getElementById('course');
  let response = await axios.get(
    'https://json-server-ehtjza--3000.local.webcontainer.io/api/v1/courses'
  );
  let courses = response.data;
  for (let course in courses) {
    var newCourse = new Option(courses[course].display, courses[course].id);
    select.options[select.options.length] = newCourse;
    console.debug('Added new course to dropdown: ', newCourse);
  }
}

function testMe() {
  console.log('Test Mode!');
  initializeCoursesDropDown();
  displayLogs('cs4660', '10111111');
  document.getElementById('uvuId').style.display = 'inline-block';
  document.getElementById('addLogBtn').disabled = false;
  // let themeToggle = document.getElementById('theme-toggle').value;
  // console.log(`Theme Toggle value: ${themeToggle}`);
}
