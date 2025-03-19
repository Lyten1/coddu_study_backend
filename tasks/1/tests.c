
#include <stdio.h>
#include "task.h"

int main()
{
    int test_accepted = 0;
    int test_count = 0;

    if (power_ranger(2, 3) == 8)
        test_accepted++;
    else
        printf("Test power_ranger(2, 3) failed\n");
    test_count++;

    if (power_ranger(2, 5) == 32)
        test_accepted++;
    else
        printf("Test power_ranger(2, 5) failed\n");
    test_count++;

    if (power_ranger(3, 1) == 3)
        test_accepted++;
    else
        printf("Test power_ranger(3, 1) failed\n");
    test_count++;

    if (power_ranger(2, 2) == 4)
        test_accepted++;
    else
        printf("Test power_ranger(2, 2) failed\n");
    test_count++;

    if (power_ranger(5, 3) == 125)
        test_accepted++;
    else
        printf("Test power_ranger(5, 3) failed\n");
    test_count++;

    printf("Tests passed: %d/%d\n", test_accepted, test_count);
    printf("status: %s\n", test_accepted == test_count ? "SUCCESS" : "FAILED");
    return 0;
}