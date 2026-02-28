# Matvei Klebcha

![My Photo](./img/avatar.jpg)

**BRU** student (since 2024)

---

## Navigation
* [About me](#about-me)
* [Soft Skills](#soft-skills)
* [Hard Skills](#hard-skills)
* [Code Example](#code-example)
* [Projects & Experience](#projects--experience)
* [Education](#education)
* [Courses & Training](#courses--training)
* [Languages](#languages)
* [Important](#important)

---

## About me
I am currently a 2nd-year student aspiring to become a Software Developer. My goal is to bring my ideas to life through code. I am deeply interested in Neural Networks, AI, and modern innovations.

---

## Soft Skills
1. **Attention to detail:** I notice things others miss.
2. **Friendly & Helpful:** Always ready to support my teammates.
3. **Sense of Humor:** I believe that coding without humor is just typing.

## Hard Skills
* **Languages:** C#, HTML, CSS
* **Tools & Environment:** Visual Studio Code, Git, MS SQL Server
* **Other:** Basic understanding of neural networks concepts.

## Code Example

```csharp
static int ShowMenu(string[] options)
{
    int selectedIndex = 1;
    int maxLength = options.Max(o => o.Length);
    while (true)
    {
        Console.Clear();
        for (int i = 0; i < options.Length; i++)
        {
            int s = (maxLength - options[i].Length) / 2;
            string paddedOption = options[i].PadRight(maxLength - s);
            if (i == selectedIndex)
            {
                paddedOption = paddedOption.PadLeft(maxLength);
                Console.BackgroundColor = ConsoleColor.Gray;
                Console.ForegroundColor = ConsoleColor.Black;
                Console.WriteLine(paddedOption);
                Console.ResetColor();
            }
            else if (i == 0 || i == options.Length - 1)
            {
                Console.ForegroundColor = ConsoleColor.Yellow;
                Console.WriteLine(paddedOption);
                Console.ResetColor();
            }
            else
            {
                Console.WriteLine(paddedOption);
            }
        }
        var key = Console.ReadKey(true).Key;
        // Logic for arrow keys omitted for brevity
        if (key == ConsoleKey.Enter) return selectedIndex;
    }
}

Projects & Experience

Since I am just starting my professional journey, here are my key milestones:

Project: "My First CV" (this)

University Coursework: many

Education

University: Belarusian-Russian University

Major: Software Engineering (PIR)

Status: 2nd Year Student

Courses & Training

YouTube Academy: "Professional C# Development" (watched tons of tutorials, still sane).

Central Testing Prep Center: "Russian Language Expert" – Successfully survived the exam and mastered the art of commas.

Languages

Russian: Native (Certified by the Central Testing exam mentioned above).

English: Intermediate (B1).

Where you can find me

Phone: +375-44-457-27-99

Email: matveiqaz2006@gmail.com

Telegram: @Merking_rey

Important

![alt text](./img/qrcode.png)

© 2026 Matvei Klebcha
