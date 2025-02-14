const chatFlow = [
  { id: 1, message: "Which city is your property located?", type: "assistant", next: 2 },
  { id: 2, message: "What is your property address or APN?", type: "assistant", next: 3 },
  { id: 3, message: "Here's your property report, including basic property information, zoning information and ADU development standard. Feel free to ask any questions at any time.", type: "assistant", next: 4 },
  { id: 4, message: "Next, I assume you are here today because you want to build an ADU on your property, is that right? \n\n Type Yes or No", type: "assistant", options: [
    { response: "YES", next: 6 },
    { response: "NO", next: 5 }
  ]},
  { id: 5, message: "Alright, is there anything else I can help today or do you have any questions for me?", type: "assistant" },
  { id: 6, message: "Alright, before we get started, I want to let you know with the help of this program, you can now design and permit a 1-story detached ADU at the comfort of your own house, all by yourself. There is no need to hire any third-party design professionals! You now have full control of the process and timeline, and you can customize the ADU design to meet your needs! \n\n Now, are you ready to start designing your dream ADU? \n\n Type Yes or No", type: "assistant", options: [
    { response: "YES", next: 8 },
    { response: "NO", next: 7 }
  ]},
  { id: 7, message: "Alright, is there anything else I can help today or do you have any questions for me?", type: "assistant" },
  { id: 8, message: "Let us first take a closer look at your site layout/configuration", type: "assistant", next: 9 },
  { id: 9, message: "Here's a site plan showing your main house location and other existing accessory structure or building on your property. \n\n The shaded area shows available open space in your backyard or sideyard, with rough dimensions indicated. \n\n Please confirm the site diagram meets the existing condition. \n\n Type Yes or No", type: "assistant", options: [
    { response: "YES", next: 10 },
    { response: "NO", next: 11 }
  ]},
  { id: 10, message: "Do you want to maximize the square footage according to the open space you have available? \n\n Or do you already know approximately how big you want your ADU to be? \n\n Type maximize or size", type: "assistant" },
  { id: 11, message: "Do you want to make changes to the dimensions of the open space? Or add or remove any existing structure(s)? \n\n Type dimensions or structures", type: "assistant" },
];

export default chatFlow;
