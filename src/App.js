import "./App.css";
import { useEffect, useState } from "react";
import { users } from "./users";
import { calculateTransactionRewards } from "./utilities";

function App() {
  //Simulate an asynchronous API call to fetch data using a promise and timeout
  const getAllUsers = () => {
    return new Promise((resolve, reject) => {
      setTimeout(resolve(users), 2000);
    });
  };

  const [errorMessage, setErrorMessage] = useState();
  const [monthlyRewardsData, setMonthlyRewardsData] = useState();

  function createRewards(users) {
    /*
    Iterate through each users transactions and calculate the rewards points using 
    A customer receives 2 points for every dollar spent over $100 in each transaction, 
    plus 1 point for every dollar spent between $50 and $100 in each transaction. 
    (e.g., a $120 purchase = 2x$20 + 1x$50 = 90 points).
    */
    const rewardsData =
      Object.keys(users).map((user) => {
        const rewardsForTansaction = users[user].map((transaction) => {
          const rewards = calculateTransactionRewards(transaction.amount);
          return {
            date: transaction.date,
            amount: transaction.amount,
            loyaltyRewards: rewards,
          };
        });

        return { user, transactions: rewardsForTansaction };
      }) || null;

    /*
    Get the last 3 months... months and put in array
    making this more dynamic in case months are different months of the year
    the create an object based on these three months and populate with data od users
    that made transactions in this time frame
    */
    const monthsData = () => {
      const months = rewardsData
        ?.map((entry) => {
          return entry.transactions.map((transaction, i) => {
            let month = new Date(transaction.date).getMonth() + 1;
            return month;
          });
        })
        .flat()
        .filter(function (item, pos, self) {
          return self.indexOf(item) === pos;
        });
      const threeMonthData = {};
      months.forEach((month, i) => {
        threeMonthData[`month${i + 1}`] = { value: month, users: {}, total: 0 };
      });

      rewardsData?.forEach((entry) => {
        entry.transactions.forEach((transaction) => {
          let month = new Date(transaction.date).getMonth() + 1;

          if (threeMonthData[`month${month}`].value === month) {
            if (
              !threeMonthData[`month${month}`].users.hasOwnProperty(entry.user)
            ) {
              threeMonthData[`month${month}`].users[`${entry.user}`] = {
                purchases: [],
              };
              threeMonthData[`month${month}`].users[
                `${entry.user}`
              ].purchases.push(transaction);
              threeMonthData[`month${month}`].users[
                `${entry.user}`
              ].totalRewards = 0;
              threeMonthData[`month${month}`].users[
                `${entry.user}`
              ].totalRewards += transaction.loyaltyRewards;
            } else {
              threeMonthData[`month${month}`].users[
                `${entry.user}`
              ].purchases.push(transaction);
              threeMonthData[`month${month}`].users[
                `${entry.user}`
              ].totalRewards += transaction.loyaltyRewards;
            }
          }
          threeMonthData[`month${month}`].total += transaction.loyaltyRewards;
        });
      });

      return threeMonthData;
    };

    return monthsData;
  }

  useEffect(() => {
    async function fetchData() {
      try {
        const users = await getAllUsers();
        const rewards = createRewards(users);

        setMonthlyRewardsData(rewards);
      } catch (err) {
        if (err) {
          const message = `Error fetching:${err}`;
          setErrorMessage(message);
        }
      }
    }
    fetchData();
  }, []);

  return (
    <div className="app">
      <div className="app-header">
        <h1>Rewards</h1>
        <div className="grid-container">
          {errorMessage && <div>There has been an error:{errorMessage}</div>}
          {monthlyRewardsData &&
            Object.entries(monthlyRewardsData).map(([key, value], i) => {
              const { users, total } = value;
              const date = new Date();
              date.setMonth(value.value - 1);

              return (
                <div key={`${value}${i}`} className="grid-item">
                  <div className="container">
                    <span>
                      {date.toLocaleString("en-US", { month: "long" })}
                    </span>
                    <h2>Month {i + 1}</h2>

                    {users &&
                      Object.entries(users).map(([key, value], i) => (
                        <div key={`${value}${i}`}>
                          {key}'s rewards for this month ={" "}
                          {value.totalRewards.toLocaleString()}
                        </div>
                      ))}

                    <div className="total">
                      Total Rewards: {total.toLocaleString()}
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}

export default App;
