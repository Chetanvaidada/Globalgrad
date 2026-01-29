import img1 from "../assets/1.jpg"
import img2 from "../assets/2.jpg"
import img3 from "../assets/3.jpg"
import img4 from "../assets/4.jpg"
import img5 from "../assets/5.jpg"
import img6 from "../assets/6.jpg"
import img7 from "../assets/7.jpg"
import img8 from "../assets/8.jpg"
import img9 from "../assets/9.jpg"
import img10 from "../assets/10.jpg"
import img11 from "../assets/11.jpg"
import img12 from "../assets/12.jpg"
import img13 from "../assets/13.jpg"
import img14 from "../assets/14.jpg"
import img15 from "../assets/15.jpg"
import img16 from "../assets/16.jpg"
import img17 from "../assets/17.jpg"
import img18 from "../assets/18.jpg"
import img19 from "../assets/19.jpg"
import img20 from "../assets/20.jpg"
export interface University {
    id: string;
    name: string;
    country: string;
    major: string;
    fee: string;
    acceptanceRate: 'Low' | 'Medium' | 'High';
    bgPhoto: string;
    description: string;
}

export const universities: University[] = [
    // --- USA ---
    {
        id: 'usa-1',
        name: 'Stanford University',
        country: 'USA',
        major: 'Computer Science',
        fee: '$65,000',
        acceptanceRate: 'Low',
        bgPhoto: img1,
        description: 'Located in Silicon Valley, offering unparalleled access to the tech industry and research opportunities.'
    },
    {
        id: 'usa-2',
        name: 'MIT',
        country: 'USA',
        major: 'Computer Science',
        fee: '$62,000',
        acceptanceRate: 'Low',
        bgPhoto: img2,
        description: 'A global leader in engineering and computer science, known for its rigorous academics and innovation.'
    },
    {
        id: 'usa-3',
        name: 'University of Washington',
        country: 'USA',
        major: 'Computer Science',
        fee: '$40,000',
        acceptanceRate: 'Medium',
        bgPhoto: img3,
        description: 'A top-tier public university with strong ties to Seattle’s booming tech sector (Microsoft, Amazon).'
    },
    {
        id: 'usa-4',
        name: 'Arizona State University',
        country: 'USA',
        major: 'Computer Science',
        fee: '$32,000',
        acceptanceRate: 'High',
        bgPhoto: img4,
        description: 'One of the largest universities in the U.S., recognized for innovation and a massive alumni network.'
    },
    {
        id: 'usa-5',
        name: 'Georgia Tech',
        country: 'USA',
        major: 'Computer Science',
        fee: '$30,000',
        acceptanceRate: 'Medium',
        bgPhoto: img5,
        description: 'A leading public research university in Atlanta, offering top-ranked engineering and computing programs.'
    },

    // --- UK ---
    {
        id: 'uk-1',
        name: 'University of Oxford',
        country: 'UK',
        major: 'Computer Science',
        fee: '$50,000',
        acceptanceRate: 'Low',
        bgPhoto: img6,
        description: 'The oldest university in the English-speaking world, offering a unique tutorial-based learning system.'
    },
    {
        id: 'uk-2',
        name: 'Imperial College London',
        country: 'UK',
        major: 'Computer Science',
        fee: '$45,000',
        acceptanceRate: 'Low',
        bgPhoto: img7,
        description: 'A world-class university in London focusing exclusively on science, engineering, medicine, and business.'
    },
    {
        id: 'uk-3',
        name: 'University of Edinburgh',
        country: 'UK',
        major: 'Computer Science',
        fee: '$30,000',
        acceptanceRate: 'Medium',
        bgPhoto: img8,
        description: 'A historic institution in Scotland known for its strong research programs and vibrant student life.'
    },
    {
        id: 'uk-4',
        name: 'University of Manchester',
        country: 'UK',
        major: 'Computer Science',
        fee: '$28,000',
        acceptanceRate: 'Medium',
        bgPhoto: img9,
        description: 'A member of the prestigious Russell Group, located in one of the UK’s most dynamic student cities.'
    },
    {
        id: 'uk-5',
        name: 'University of Leeds',
        country: 'UK',
        major: 'Computer Science',
        fee: '$25,000',
        acceptanceRate: 'High',
        bgPhoto: img10,
        description: 'A large, campus-based university with a strong focus on research impact and student experience.'
    },

    // --- Canada ---
    {
        id: 'can-1',
        name: 'University of Toronto',
        country: 'Canada',
        major: 'Computer Science',
        fee: '$45,000',
        acceptanceRate: 'Low',
        bgPhoto: img11,
        description: 'Canada’s top-ranked university, located in a diverse city with a thriving tech ecosystem.'
    },
    {
        id: 'can-2',
        name: 'UBC (Vancouver)',
        country: 'Canada',
        major: 'Computer Science',
        fee: '$40,000',
        acceptanceRate: 'Low',
        bgPhoto: img12,
        description: 'Known for its stunning campus and strong emphasis on sustainability and research excellence.'
    },
    {
        id: 'can-3',
        name: 'University of Waterloo',
        country: 'Canada',
        major: 'Computer Science',
        fee: '$35,000',
        acceptanceRate: 'Medium',
        bgPhoto: img13,
        description: 'Famous for its cooperative education (co-op) program, providing significant work experience.'
    },
    {
        id: 'can-4',
        name: 'McGill University',
        country: 'Canada',
        major: 'Computer Science',
        fee: '$30,000',
        acceptanceRate: 'Medium',
        bgPhoto: img14,
        description: 'Located in Montreal, McGill is known for its international reputation and diverse student body.'
    },
    {
        id: 'can-5',
        name: 'Dalhousie University',
        country: 'Canada',
        major: 'Computer Science',
        fee: '$18,000',
        acceptanceRate: 'High',
        bgPhoto: img15,
        description: 'A major research university in Nova Scotia, offering a friendly community and coastal lifestyle.'
    },

    // --- Australia ---
    {
        id: 'aus-1',
        name: 'University of Melbourne',
        country: 'Australia',
        major: 'Computer Science',
        fee: '$42,000',
        acceptanceRate: 'Low',
        bgPhoto: img16,
        description: 'Australia’s leading university, offering a flexible "Melbourne Model" curriculum structure.'
    },
    {
        id: 'aus-2',
        name: 'UNSW Sydney',
        country: 'Australia',
        major: 'Computer Science',
        fee: '$40,000',
        acceptanceRate: 'Medium',
        bgPhoto: img17,
        description: 'A powerhouse in engineering and technology, with strong industry connections in Sydney.'
    },
    {
        id: 'aus-3',
        name: 'University of Queensland',
        country: 'Australia',
        major: 'Computer Science',
        fee: '$35,000',
        acceptanceRate: 'Medium',
        bgPhoto: img18,
        description: 'Located in Brisbane, UQ is known for its beautiful campus and high-impact research.'
    },
    {
        id: 'aus-4',
        name: 'Monash University',
        country: 'Australia',
        major: 'Computer Science',
        fee: '$32,000',
        acceptanceRate: 'High',
        bgPhoto: img19,
        description: 'The largest university in Australia, with a global footprint and modern facilities.'
    },
    {
        id: 'aus-5',
        name: 'RMIT University',
        country: 'Australia',
        major: 'Computer Science',
        fee: '$22,000',
        acceptanceRate: 'High',
        bgPhoto: img20,
        description: 'Known for its practical focus, design excellence, and central location in Melbourne.'
    }
];
