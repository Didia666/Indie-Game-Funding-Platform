#![no_std]
use soroban_sdk::{contract, contractimpl, token, Address, Env, Vec};

#[contract]
pub struct RevenueShareContract;

#[contractimpl]
impl RevenueShareContract {
    /// Distributes revenue to backers based on their shares.
    /// This is a simplified version for demonstration.
    pub fn distribute(
        e: Env, 
        token_address: Address, 
        total_revenue: i128, 
        backers: Vec<Address>, 
        shares: Vec<i128>
    ) {
        let token = token::Client::new(&e, &token_address);
        
        for i in 0..backers.len() {
            let backer = backers.get(i).expect("backer not found");
            let share = shares.get(i).expect("share not found");
            
            // Calculate the backer's share of the revenue (e.g., share is in percentage)
            let amount = (total_revenue * share) / 100;
            
            if amount > 0 {
                // Ensure the contract has enough funds before calling transfer
                token.transfer(&e.current_contract_address(), &backer, &amount);
            }
        }
    }
}
