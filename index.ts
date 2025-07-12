import { writeFileSync } from "fs";

async function getTodayHistory() {

  const date = new Date();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const url = `http://history.muffinlabs.com/date/${month}/${day}`;

  try {
    const res = await fetch(url);
    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Error fetching today's history: ", error);
    throw error;
  }
}

function renderHTML(htmlString: string) {
  const markdownString = htmlString.replace(/<a\s+(?:[^>]*?\s+)?href=(["'])(.*?)\1(?:[^>]*?\s+)?title=(["'])(.*?)\3(?:[^>]*?>)(.*?)<\/a>/gi, '[$5]($2 "$4")');
  return markdownString;
}

const currentDate = new Date();
const day = currentDate.getDate();
let daySuffix;
if (day === 1 || day === 21 || day === 31) {
  daySuffix = "st";
} else if (day === 2 || day === 22) {
  daySuffix = "nd";
} else if (day === 3 || day === 23) {
  daySuffix = "rd";
} else {
  daySuffix = "th";
}

const formattedDate = `${day}${daySuffix} ${currentDate.toLocaleString('default', { month: 'long' })} ${currentDate.getFullYear()}`;

async function updateREADME(historyData: any) {
  const events = historyData.data.Events;
  const timestamp = new Date().toLocaleString();

  let content = `
# Today's History 📜

${formattedDate}

`;

  events.reverse().forEach((event: any, index: number) => {
    const renderedEvent = renderHTML(event.html);
    content += `
## Year - ${event.year}
${renderedEvent.substring(6)}
`;
  });

  content += `
<br />

> _Last Updated: ${timestamp} (in GMT)_
`;

  writeFileSync("README.md", content);
}



async function main() {
  try {
    const historyData = await getTodayHistory();
    await updateREADME(historyData);
  } catch (error) {
    console.error("Error: ", error);
  }
}

main();