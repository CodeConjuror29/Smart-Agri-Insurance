// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract SimpleAgriInsurance {

    address public admin;
    address public oracle;

    enum Status { Active, PaidOut }

    struct Policy {
        address farmer;
        uint256 insuredAmount;
        uint256 rainfallThreshold;
        uint256 recordedRainfall;
        Status status;
        bool exists;
    }

    Policy public policy;

    event PolicyCreated(address farmer, uint256 insuredAmount, uint256 threshold);
    event RainfallUpdated(uint256 rainfall);
    event PayoutTriggered(address farmer, uint256 amount);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Not admin");
        _;
    }

    modifier onlyOracle() {
        require(msg.sender == oracle, "Not oracle");
        _;
    }

    constructor(address _oracle) {
        admin = msg.sender;
        oracle = _oracle;
    }

    // Create a policy (only once)
    function createPolicy(
        address _farmer,
        uint256 _insuredAmount,
        uint256 _rainfallThreshold
    ) external onlyAdmin {
        require(!policy.exists, "Policy already exists");

        policy = Policy({
            farmer: _farmer,
            insuredAmount: _insuredAmount,
            rainfallThreshold: _rainfallThreshold,
            recordedRainfall: 0,
            status: Status.Active,
            exists: true
        });

        emit PolicyCreated(_farmer, _insuredAmount, _rainfallThreshold);
    }

    // Fund contract so payout is possible
    function fundContract() external payable onlyAdmin {}

    // Oracle updates rainfall
    function updateRainfall(uint256 _rainfall) external onlyOracle {
        require(policy.exists, "No policy");
        require(policy.status == Status.Active, "Policy not active");

        policy.recordedRainfall = _rainfall;

        emit RainfallUpdated(_rainfall);
    }

    // Trigger payout manually after rainfall update
    function triggerPayout() external {
        require(policy.exists, "No policy");
        require(policy.status == Status.Active, "Policy not active");

        if (policy.recordedRainfall < policy.rainfallThreshold) {

            policy.status = Status.PaidOut;

            require(address(this).balance >= policy.insuredAmount, "Insufficient funds");

            (bool sent, ) = payable(policy.farmer).call{value: policy.insuredAmount}("");
            require(sent, "Transfer failed");

            emit PayoutTriggered(policy.farmer, policy.insuredAmount);
        }
    }

    // Allow contract to receive ETH
    receive() external payable {}
}