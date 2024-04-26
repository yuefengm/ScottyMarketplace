import React from "react";
import "../../static/css/About.css";

const teamMembers = [
    {
        id: 1,
        name: "Yucheng Nie",
        title: "Software Engineer",
        bio: "I'm an ECE student who contributed to our team by developing the payment and transaction endpoints. Additionally, I worked on creating the shopping and selling page and handled the deployment of our product. Outside of work, I enjoy staying active with workouts and hiking. Let's connect so we can hit the gym or hit the trails together!",
        imageUrl:"../static/images/yuchengnie.jpg",
        linkedInUrl: "https://www.linkedin.com/in/yucheng-nie/"
    },
    {
        id: 2,
        name: "Yuefeng Ma",
        title: "Software Engineer",
        bio: "I am a Heinz student from MISM program and graduating this May. " +
        "My contributions to the program focused on constructing profile pages" +
        "and establishing web socket chat function. I love playing video games and watching movies. " +
        "Let’s connect on LinkedIn!",
        imageUrl: "../static/images/yuefengma.jpg",
        linkedInUrl: "https://www.linkedin.com/in/yuefengma/"
    },
    {
        id: 3,
        name: "Yuanyuan Zheng",
        title: "Software Engineer",
        bio: "I'm a MISM student at CMU graduating in May." +
        "I'm involved in Google OAuth authentication and handle" +
        "the implementation of shopping cart and chat box functionalities" +
        "on both the backend and frontend of our web application. " + 
        "Outside of academics, I delight in forging new friendships, exploring new places, and networking on LinkedIn!",
        imageUrl: "../static/images/yuanyuanzheng.jpg",
        linkedInUrl: "https://www.linkedin.com/in/yuanyuan-zheng/"
    },
    {
        id: 4,
        name: "Yutong Cai",
        title: "Software Engineer",
        bio: "I am a MISM student at CMU graduating in May. " +
         "I contribute to formatting the frontend of Shop and Sell pages in this web application. " +
         "I enjoy making friends, chatting with people, and connecting on LinkedIn!",
        imageUrl: "../static/images/yutongcai.jpg",
        linkedInUrl: "https:/www.linkedin.com/in/vera-cai/"
    },
];

const TeamMember = ({ name, title, bio, imageUrl, linkedInUrl }) => {
  return (
    <div className="team-member">
      <img src={imageUrl} alt={`Portrait of ${name}`} className="team-photo" />
      <h3 className="team-name">{name}</h3>
      <p className="team-title">{title}</p>
      <p className="team-bio">{bio}</p>
      <a href={linkedInUrl} target="_blank" rel="noopener noreferrer">
        LinkedIn
      </a>
    </div>
  );
};

const About = () => {
  return (
    <div className="about-container">
        <h1 className="about-heading">About Us</h1>
        <div className="about-description">
            We're a group of students enrolled in the Web Application course at CMU. Trust us, it's the best course—you definitely should take it!
        </div>
        <section className="team-section">
            <h2 className="team-heading">Meet the Team</h2>
            <div className="team-grid">
                {teamMembers.map((member) => (
                <TeamMember key={member.id} {...member} />
                ))}
                </div>
                </section>
            </div>
  );
};

export default About;
