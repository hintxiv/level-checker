import * as ICONS from 'components/JobIcons'
import { Job } from 'types'
import { preserve } from 'util/typeutils'

export const JOBS = preserve<Job>()({
    Unknown: {
        name: 'Unknown',
        color: '#000000',
        Icon: ICONS.DancerIcon,
        sortOrder: Infinity,
    },

    // Tanks
    DarkKnight: {
        name: 'Dark Knight',
        color: '#d126cc',
        Icon: ICONS.DarkKnightIcon,
        sortOrder: 1,
    },
    Gunbreaker: {
        name: 'Gunbreaker',
        color: '#796d30',
        Icon: ICONS.GunbreakerIcon,
        sortOrder: 2,
    },
    Paladin: {
        name: 'Paladin',
        color: '#a8d2e6',
        Icon: ICONS.PaladinIcon,
        sortOrder: 3,
    },
    Warrior: {
        name: 'Warrior',
        color: '#cf2621',
        Icon: ICONS.WarriorIcon,
        sortOrder: 4,
    },

    // Healers
    Astrologian: {
        name: 'Astrologian',
        color: '#ffe74a',
        Icon: ICONS.AstrologianIcon,
        sortOrder: 5,
    },
    Sage: {
        name: 'Sage',
        color: '#80a0f0',
        Icon: ICONS.SageIcon,
        sortOrder: 6,
    },
    Scholar: {
        name: 'Scholar',
        color: '#8657ff',
        Icon: ICONS.ScholarIcon,
        sortOrder: 7,
    },
    WhiteMage: {
        name: 'White Mage',
        color: '#fff0dc',
        Icon: ICONS.WhiteMageIcon,
        sortOrder: 8,
    },

    // Melee
    Dragoon: {
        name: 'Dragoon',
        color: '#4164cd',
        Icon: ICONS.DragoonIcon,
        sortOrder: 9,
    },
    Monk: {
        name: 'Monk',
        color: '#d69c00',
        Icon: ICONS.MonkIcon,
        sortOrder: 10,
    },
    Ninja: {
        name: 'Ninja',
        color: '#af1964',
        Icon: ICONS.NinjaIcon,
        sortOrder: 11,
    },
    Reaper: {
        name: 'Reaper',
        color: '#965a90',
        Icon: ICONS.ReaperIcon,
        sortOrder: 12,
    },
    Samurai: {
        name: 'Samurai',
        color: '#e46d04',
        Icon: ICONS.SamuraiIcon,
        sortOrder: 13,
    },
    Viper: {
        name: 'Viper',
        color: '#66d266',
        Icon: ICONS.ViperIcon,
        sortOrder: 14,
    },

    // Physical Ranged
    Bard: {
        name: 'Bard',
        color: '#91ba5e',
        Icon: ICONS.BardIcon,
        sortOrder: 15,
    },
    Dancer: {
        name: 'Dancer',
        color: '#e2b0af',
        Icon: ICONS.DancerIcon,
        sortOrder: 16,
    },
    Machinist: {
        name: 'Machinist',
        color: '#6ee1d6',
        Icon: ICONS.MachinistIcon,
        sortOrder: 17,
    },

    // Casters
    BlackMage: {
        name: 'Black Mage',
        color: '#a579d6',
        Icon: ICONS.BlackMageIcon,
        sortOrder: 18,
    },
    Pictomancer: {
        name: 'Pictomancer',
        color: '#ff8bee',
        Icon: ICONS.PictomancerIcon,
        sortOrder: 19,
    },
    RedMage: {
        name: 'Red Mage',
        color: '#e87b7b',
        Icon: ICONS.RedMageIcon,
        sortOrder: 20,
    },
    Summoner: {
        name: 'Summoner',
        color: '#2d9b78',
        Icon: ICONS.SummonerIcon,
        sortOrder: 21,
    },
})
