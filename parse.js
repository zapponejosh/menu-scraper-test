import fs from "fs";

async function parse() {
  await fs.promises.writeFile("./redirects.txt", "", function clearFile() {
    console.log("cleared");
  });
  let writeStream = fs.createWriteStream("redirects.txt");

  try {
    const allFiles = await fs.promises.readdir("./");
    const files = allFiles.filter(
      (name) =>
        name.includes(".json") &&
        !name.includes("package") &&
        !name.includes("redirects")
    );

    for (const file of files) {
      fs.readFile(`./${file}`, "utf8", (err, data) => {
        if (err) throw err;
        const arr = JSON.parse(data);
        const siteArr = [];
        siteArr.push(
          `--------------------%${file
            .replace(".json", "")
            .toUpperCase()}%--------------------%`
        );
        arr.forEach((item) => {
          if (item.redirectUrls.length) {
            const obj = {
              menuLink: item.page,
              redirectsTo: item.redirectUrls[item.redirectUrls.length - 1],
            };
            siteArr.push(obj);
          }
        });
        const formatted = JSON.stringify(siteArr)
          .replace(/,|%/g, "\n")
          .replace(/}/g, "\n\n")
          .replace(/\[|\]|"|{/g, "");
        writeStream.write(formatted);
      });
    }
  } catch (e) {
    console.error("We've thrown! Whoops!", e);
  }
}

export default parse;
