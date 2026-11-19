<?php

namespace Tests\Unit;

use Database\Seeders\SqlStaffSeeder;
use ReflectionMethod;
use Tests\TestCase;

class SqlStaffSeederTest extends TestCase
{
    public function test_placeholder_values_are_replaced_with_null(): void
    {
        $seeder = new SqlStaffSeeder;
        $statement = "INSERT INTO `staff` (`id`, `present_command`, `state_of_origin`) VALUES (1, '? string:1 ?', 'Abia')";

        $result = $this->callFixEmptyStringsForIntegerColumns($seeder, $statement);

        $this->assertSame(
            "INSERT INTO `staff` (`id`, `present_command`, `state_of_origin`) VALUES (1, NULL, 'Abia')",
            $result
        );
    }

    public function test_unquoted_placeholder_values_are_replaced_with_null(): void
    {
        $seeder = new SqlStaffSeeder;
        $statement = "INSERT INTO `staff` (`id`, `present_command`, `state_of_origin`) VALUES (1, ? string:1 ?, 'Abia')";

        $result = $this->callFixEmptyStringsForIntegerColumns($seeder, $statement);

        $this->assertSame(
            "INSERT INTO `staff` (`id`, `present_command`, `state_of_origin`) VALUES (1, NULL, 'Abia')",
            $result
        );
    }

    public function test_placeholder_values_with_text_are_replaced_with_null(): void
    {
        $seeder = new SqlStaffSeeder;
        $statement = "INSERT INTO `staff` (`id`, `state_of_origin`) VALUES (1, '? string:Abia ?')";

        $result = $this->callFixEmptyStringsForIntegerColumns($seeder, $statement);

        $this->assertSame(
            'INSERT INTO `staff` (`id`, `state_of_origin`) VALUES (1, NULL)',
            $result
        );
    }

    public function test_placeholder_values_with_object_tokens_are_replaced_with_null(): void
    {
        $seeder = new SqlStaffSeeder;
        $statement = "INSERT INTO `staff_details` (`id`, `housing`) VALUES (1, '? object:null ? ?')";

        $result = $this->callFixEmptyStringsForIntegerColumns($seeder, $statement);

        $this->assertSame(
            'INSERT INTO `staff_details` (`id`, `housing`) VALUES (1, NULL)',
            $result
        );
    }

    public function test_placeholder_values_without_trailing_question_mark_are_replaced_with_null(): void
    {
        $seeder = new SqlStaffSeeder;
        $statement = "INSERT INTO `staff` (`id`, `department`) VALUES (1, '? undefine')";

        $result = $this->callFixEmptyStringsForIntegerColumns($seeder, $statement);

        $this->assertSame(
            'INSERT INTO `staff` (`id`, `department`) VALUES (1, NULL)',
            $result
        );
    }

    protected function callFixEmptyStringsForIntegerColumns(SqlStaffSeeder $seeder, string $statement): string
    {
        $method = new ReflectionMethod($seeder, 'fixEmptyStringsForIntegerColumns');
        $method->setAccessible(true);

        return $method->invoke($seeder, $statement);
    }
}
