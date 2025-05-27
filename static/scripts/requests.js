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

const basicInfo = {
query:`
{
    user {
        login
        firstName
        lastName
        email
        attrs(path:"tel")
        campus
    }
    level: transaction(
    where: {
      _and: [
        { type: { _eq: "level" } },
        { event: { object: { name: { _eq: "Module" } } } }
      ]
    }
   order_by: { amount: desc }
    limit: 1
  ) {
    amount
  }
    xp: transaction_aggregate(
            where: {_and: [{type: {_like: "xp"}}, {_or: [{originEventId: {_eq: 41}}, {path: {_ilike: "/oujda/module/checkpoint/%"}}, {path: {_ilike: "/oujda/module/piscine-js"}}]}]}
          ) { 
          aggregate {
            sum {
              amount
            }
          }
        }
}`
};

export { basicInfo };