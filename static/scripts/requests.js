
const Info = {
    query: `
{
    user {
        login
        firstName
        lastName
        email
        phone: attrs(path:"tel")
        campus
        totalUp
        totalDown
        totalUpBonus
        auditRatio
        conditionsAccepted: attrs(path:"general-conditionsAccepted")
        singServicesAccepted:attrs(path:"using-our-servicesAccepted")
    audits_succeeded: audits_aggregate(where: {closureType: {_eq: succeeded}}) {
      aggregate {
        count
      }
    }
    audits_failed: audits_aggregate(where: {closureType: {_eq: failed}}) {
      aggregate {count}
    }    
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
    projects:  user {
            transactions(
                where: {type: {_eq: "xp"}, event: {object: {name: {_eq: "Module"}}}}
                order_by: {createdAt: desc}
            ) {
            object {
                name
                type
                progresses {
                    group {
                        members {
                            userLogin
                        }
                    }
                }
            }
            amount
            createdAt
            }
        }
}`
};

export { Info };