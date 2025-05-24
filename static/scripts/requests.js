const req = {
    query: `
    {
        user {
            id
            login
            firstName
            lastName
            email
            campus
            auditRatio
            totalUp
            totalDown
            xpTotal: transactions_aggregate(
                where: { eventId: { _eq: 41 }, type: { _eq: "xp" } }
            ) {
                aggregate {
                    sum {
                        amount
                    }
                }
            }
            xp: transactions(
                order_by: { createdAt: asc },
                where: { eventId: { _eq: 41 }, type: { _eq: "xp" } }
            ) {
                createdAt
                amount
                path
            }
            finished_projects: groups(
                where: { group: { status: { _eq: finished } } }
            ) {
                group {
                    path
                    status
                }
            }
            current_projects: groups(
                where: { group: { status: { _eq: working } } }
            ) {
                group {
                    path
                    status
                    members {
                        userLogin
                    }
                }
            }
            setup_project: groups(
                where: { group: { status: { _eq: setup } } }
            ) {
                group {
                    path
                    status
                    members {
                        userLogin
                    }
                }
            }
            skills: transactions(
                order_by: { type: asc, amount: desc },
                distinct_on: [type],
                where: { _and: { type: { _like: "skill_%" } } }
            ) {
                type
                amount
            }
        }
    }
    `
};

export { req };